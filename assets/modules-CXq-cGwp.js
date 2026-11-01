import{c as r,t as s}from"./index-BBsQTG4F.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const a=r("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);async function c(){const t=[];let i=0;do{const{data:e,error:n,count:o}=await s.from("modules").select("id, title, description, file_data, file_name",{count:"exact"}).order("created_at",{ascending:!0}).order("id",{ascending:!0}).range(t.length,t.length+99);if(n)throw n;if(!e||o===null)throw new Error("Module response is incomplete.");if(i=o,!e.length&&t.length<i)throw new Error("Module pagination stopped before completion.");t.push(...e)}while(t.length<i);return t.map(e=>{if(typeof e.id!="string"||typeof e.title!="string")throw new Error("Module record is missing its ID or title.");return{id:e.id,title:e.title,description:e.description||"",objectives:[],contentSections:[{heading:"Overview & Objectives",body:e.description||""}],file_name:e.file_name||"",file_data:e.file_data}})}export{a as C,c as f};
