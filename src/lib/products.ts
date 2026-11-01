import { supabase, moduleCatalog as catalog } from './supabase';
import { MARKET_CATEGORIES, type Product } from '../data/marketProducts';

export const PRODUCT_BUCKET = 'product-photos';
const columns = 'id,owner_id,name,category,type,price,unit,stock,status,seller_name,seller_phone,location,description,photo_path,photo_url,created_at,updated_at';
type Row = { id: string; owner_id: string; name: string; category: Product['category']; type: Product['type']; price: number; unit: string; stock: number; status: Product['status']; seller_name: string; seller_phone: string; location: string; description: string; photo_path: string; photo_url: string; created_at: string; updated_at: string };
const product = (row: Row): Product => ({ id: row.id, ownerId: row.owner_id, name: row.name, category: row.category, type: row.type, price: Number(row.price), unit: row.unit, availableStock: Number(row.stock), stockUnit: row.unit, status: row.status, seller: row.seller_name, sellerPhone: row.seller_phone, location: row.location, description: row.description, image: row.photo_url, photoPath: row.photo_path, createdAt: row.created_at, updatedAt: row.updated_at });

export function validatePhoto(file: File) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size < 1 || file.size > 5 * 1024 * 1024) throw new Error('Choose a JPG, PNG, or WebP photo up to 5 MB.');
}

export function validateProduct(input: Partial<Product>) {
  for (const field of ['name', 'seller', 'sellerPhone', 'location', 'unit'] as const) {
    if (typeof input[field] !== 'string' || !input[field].trim() || input[field].length > (field === 'location' ? 200 : 120)) throw new Error('Complete the product and seller information.');
  }
  if (!MARKET_CATEGORIES.slice(1).includes(input.category) || !['Farm Product', 'Fishery Product', 'Processed Product'].includes(input.type)) throw new Error('Choose a valid category and product type.');
  if (!/^\+?[\d ()-]{7,25}$/.test(input.sellerPhone) || input.sellerPhone.replace(/\D/g, '').length < 7) throw new Error('Enter a valid contact phone number.');
  if (!Number.isFinite(input.price) || input.price <= 0 || input.price > 1_000_000_000 || Math.abs(input.price * 100 - Math.round(input.price * 100)) > 0.00001) throw new Error('Enter a positive price with at most two decimal places.');
  if (!Number.isFinite(input.availableStock) || input.availableStock < 0 || input.availableStock > 1_000_000_000 || Math.abs(input.availableStock * 1000 - Math.round(input.availableStock * 1000)) > 0.00001) throw new Error('Enter a nonnegative stock quantity with at most three decimal places.');
  if (!['Available', 'Out of Stock', 'Unavailable'].includes(input.status)) throw new Error('Choose a valid product status.');
  if ((input.description || '').length > 3000) throw new Error('Keep the description within 3000 characters.');
}

export async function fetchProducts(): Promise<Product[]> {
  const rows: Row[] = [];
  let total = 0;
  do {
    const { data, error, count } = await catalog.from('marketplace_products').select(columns, { count: 'exact' }).order('created_at', { ascending: false }).order('id').range(rows.length, rows.length + 99);
    if (error) throw new Error('Products could not be loaded. Check your connection and marketplace database setup.');
    if (!data || count === null || (!data.length && rows.length < count)) throw new Error('The product response was incomplete. Please refresh.');
    rows.push(...data); total = count;
  } while (rows.length < total);
  return rows.map(product);
}

async function member() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Sign in to manage your products.');
  return data.user;
}

async function removePhoto(path: string): Promise<boolean> {
  try { const { error } = await supabase.storage.from(PRODUCT_BUCKET).remove([path]); return !error; } catch { return false; }
}

export async function saveProduct(input: Partial<Product>, photo: File | null, original?: Product): Promise<{ product: Product; warning?: string }> {
  validateProduct(input);
  if (photo) {
    validatePhoto(photo);
    const bytes = new Uint8Array(await photo.slice(0, 12).arrayBuffer());
    const signature = [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
    const valid = photo.type === 'image/jpeg' ? signature.startsWith('ffd8ff') : photo.type === 'image/png' ? signature.startsWith('89504e470d0a1a0a') : signature.startsWith('52494646') && signature.slice(16, 24) === '57454250';
    if (!valid) throw new Error('The selected file is not a valid JPG, PNG, or WebP photo.');
  }
  if (!original && !photo) throw new Error('Choose a product photo.');
  const user = await member();
  if (original && original.ownerId !== user.id) throw new Error('You can only manage your own products.');
  const id = original?.id || crypto.randomUUID();
  let photoPath = original?.photoPath;
  let photoUrl = original?.image;
  if (photo) {
    const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[photo.type];
    photoPath = `${user.id}/${id}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from(PRODUCT_BUCKET).upload(photoPath, photo, { contentType: photo.type, upsert: false });
    if (error) throw new Error('Photo upload failed. Check your connection and product-photos bucket permissions.');
    photoUrl = supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(photoPath).data.publicUrl;
  }
  const values = { name: input.name.trim(), category: input.category, type: input.type, price: input.price, unit: input.unit.trim(), stock: input.availableStock, status: input.availableStock === 0 && input.status === 'Available' ? 'Out of Stock' : input.status, seller_name: input.seller.trim(), seller_phone: input.sellerPhone.trim(), location: input.location.trim(), description: input.description?.trim() || '', photo_path: photoPath, photo_url: photoUrl };
  const query = original
    ? supabase.from('marketplace_products').update(values).eq('id', id).eq('owner_id', user.id).eq('updated_at', original.updatedAt)
    : supabase.from('marketplace_products').insert({ ...values, id, owner_id: user.id });
  const { data, error } = await query.select(columns).single();
  if (error || !data) {
    // An uncertain network result may already be committed; never delete its uploaded photo.
    if (photo && ['42501', '23514', '23503', '23505', '22P02', 'PGRST116'].includes(error?.code)) await removePhoto(photoPath);
    throw new Error(error?.code === 'PGRST116' ? 'This product changed or was deleted. Refresh before editing again.' : 'Product could not be saved. Refresh before retrying and check database permissions.');
  }
  const cleaned = !photo || !original?.photoPath || await removePhoto(original.photoPath);
  return { product: product(data), warning: cleaned ? undefined : 'Product saved, but the previous photo could not be removed.' };
}

export async function deleteProduct(original: Product): Promise<{ warning?: string }> {
  const user = await member();
  if (original.ownerId !== user.id) throw new Error('You can only manage your own products.');
  const { data, error } = await supabase.from('marketplace_products').delete().eq('id', original.id).eq('owner_id', user.id).eq('updated_at', original.updatedAt).select('id').single();
  if (error || !data) throw new Error('Product could not be deleted. Refresh first; it may have changed or you may lack permission.');
  const cleaned = !original.photoPath || await removePhoto(original.photoPath);
  return { warning: cleaned ? undefined : 'Product deleted, but its photo could not be removed.' };
}
