import { chromium } from '@playwright/test';
import fs from 'fs';
const S='/private/tmp/claude-501/-Users-palphinho/ce48bcab-576a-446f-93bc-f8ea4d700f66/scratchpad/persona-amina';
const stage=process.argv[2];
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:900},colorScheme:'dark',locale:'fr-FR',acceptDownloads:true,storageState:stage==='1'?undefined:S+'/state.json'});
const p=await c.newPage();
p.on('console',m=>{if(m.type()==='error')console.log('ERR',m.text().slice(0,200))});p.on('pageerror',e=>console.log('PE',e.message));
const W=ms=>p.waitForTimeout(ms);
const tx=(l,i=0)=>p.getByLabel(l,{exact:true}).nth(i);
const shot=async(n,clip)=>{await W(1200);await p.screenshot({path:`${S}/${n}.png`,...(clip?{clip}:{})})};
async function fill(d){
  await tx('Prénom').fill(d.pre);await tx('Nom').fill(d.nom);await tx('Titre du poste visé').fill(d.titre);
  await p.locator('input[type=file]').first().setInputFiles(S+'/photo.png');
  await tx('Lieu').first().fill(d.lieu);await tx('E-mail').fill('amina@benali.design');await tx('Téléphone').fill('+33 6 12 34 56 78');await tx('Site web').fill('benali.design');
  await tx('Texte').fill(d.profil);
  const add=p.getByRole('button',{name:'+ Ajouter un élément'});
  await add.nth(3).click();await add.nth(3).click();await add.nth(2).click();await add.nth(1).click();await add.nth(0).click();await W(300);
  console.log('counts poste',await p.getByLabel('Poste',{exact:true}).count(),'dipl',await p.getByLabel('Diplôme',{exact:true}).count(),'cat',await p.getByPlaceholder('Savoir-être, Outils, Langues…').count(),'langue',await p.getByLabel('Langue',{exact:true}).count());
  const mo=p.locator('select:has(option:text-is("janv."))'),yr=p.locator('select:has(option[value="2021"])');
  for(const [i,e] of d.exp.entries()){
    await tx('Poste',i).fill(e[0]);await tx('Entreprise',i).fill(e[1]);await tx('Lieu',i+1).fill(e[2]);
    await mo.nth(2*i).selectOption({index:e[3][0]});await yr.nth(2*i).selectOption(String(e[3][1]));
    if(e[4]) await p.getByLabel('En cours').nth(i).check(); else {await mo.nth(2*i+1).selectOption({index:e[5][0]});await yr.nth(2*i+1).selectOption(String(e[5][1]));}
    await p.getByLabel('Description').nth(i).fill(e[6]);
  }
  for(const [i,e] of d.edu.entries()){
    await tx('Diplôme',i).fill(e[0]);await tx('École',i).fill(e[1]);await tx('Lieu',2+i+1).fill(e[2]);
    await mo.nth(4+2*i).selectOption({index:e[3][0]});await yr.nth(4+2*i).selectOption(String(e[3][1]));
    await mo.nth(5+2*i).selectOption({index:e[4][0]});await yr.nth(5+2*i).selectOption(String(e[4][1]));
  }
  for(const [i,e] of d.sk.entries()){await p.getByPlaceholder('Savoir-être, Outils, Langues…').nth(i).fill(e[0]);await p.locator('textarea[placeholder*="Sens du contact"]').nth(i).fill(e[1]);}
  for(const [i,e] of d.lg.entries()){await tx('Langue',i).fill(e[0]);await p.locator('textarea[placeholder="Courant"]').nth(i).fill(e[1]);}
}
const FR={pre:'Amina',nom:'Benali',titre:'Graphiste UI freelance',lieu:'Lille, France',
 profil:"Graphiste UI indépendante depuis 6 ans. Je conçois des interfaces et des systèmes de design pour des produits SaaS et des applications mobiles, de la recherche utilisateur à la livraison des composants.",
 exp:[['Directrice artistique UI','Studio Lumen','Paris',[3,2021],true,null,"- Refonte du design system de 4 produits, 120 composants documentés\n- Hausse du taux de conversion de 18 % à 27 % après le nouveau parcours d'inscription\n- Encadrement de 3 designers juniors"],
      ['Graphiste UI','Agence Nord','Lille',[9,2018],false,[3,2021],"- Maquettes et prototypes pour 15 clients\n- Note de satisfaction passée de 3,8 à 4,6\n- Création d'une bibliothèque d'icônes de 300 pictogrammes"]],
 edu:[['Master Design numérique','Université de Lille','Lille',[9,2016],[6,2018]],['Licence Arts appliqués','Université de Lille','Lille',[9,2013],[6,2016]]],
 sk:[['Design',"Figma, design systems, prototypage, motion"],['Outils',"Illustrator, After Effects, HTML/CSS"]],
 lg:[['Français','Langue maternelle'],['Arabe','Langue maternelle'],['Anglais','Courant']]};
if(stage==='1'){
  await p.goto('http://localhost:4303/#/editeur');await W(1500);
  await p.getByRole('button',{name:'Complet'}).click();await W(800);
  await fill(FR);
  await shot('10-filled-fr');
  console.log('saved');
  await c.storageState({path:S+'/state.json'});
}
await b.close();
