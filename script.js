/* «Твоя Кухня» — independent demonstration concept.
   No data is uploaded or sent, no price or stock is invented. */
(() => {
  'use strict';
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const projectData = {
    kitchen: {
      kind: 'Кухня', kicker: 'КУХНЯ · БОЛЬШОЙ САМОВЕЦ · 12 НОЯБРЯ 2026', title: 'Фактура камня и бетона',
      description: 'Угловая кухня размером 3,3 × 1,9 м. По описанию компании, дизайнер Альбина выбрала пластиковые фасады Gentas: верхние декорированы под светлый камень, нижние — под серый бетон. Для фартука и столешницы указан декор «Эвора серая».',
      image: './assets/project-kitchen.svg', imageAlt: 'Авторская иллюстрация угловой кухни с серыми фасадами',
      specs: [['Тип','Угловая кухня'],['Размер','3,3 × 1,9 м'],['Материал','Пластик Gentas'],['Столешница','«Эвора серая»'],['Дизайнер','Альбина']]
    },
    wardrobe: {
      kind: 'Шкаф', kicker: 'ШКАФ-КУПЕ · ЖК «ГЕОМЕТРИЯ» · 9 НОЯБРЯ 2026', title: 'Зеркала во всю высоту',
      description: 'Шкаф-купе высотой 2 690 мм для квартиры в ЖК «Геометрия». По опубликованному описанию компания отмечает участие дизайнера Екатерины, сотрудников доставки и специалистов по подбору фурнитуры.',
      image: './assets/project-wardrobe.svg', imageAlt: 'Авторская иллюстрация зеркального шкафа-купе',
      specs: [['Тип','Шкаф-купе'],['Высота','2 690 мм'],['Объект','ЖК «Геометрия»'],['Дизайнер','Екатерина']]
    },
    hallway: {
      kind: 'Прихожая', kicker: 'ПРИХОЖАЯ · ЖК «ГЕОМЕТРИЯ» · 10 НОЯБРЯ 2026', title: 'Характер в каждой линии',
      description: 'Прихожая в стиле лофт высотой 2 640 мм. В публикации отмечено сочетание графитового, белого жемчужного и древесного оттенков с декором «Ароза Реликтовая». Проект дизайнера Екатерины.',
      image: './assets/project-hallway.svg', imageAlt: 'Авторская иллюстрация прихожей в стиле лофт',
      specs: [['Тип','Прихожая'],['Высота','2 640 мм'],['Отделка','Графит, белый жемчужный, древесный декор'],['Дизайнер','Екатерина']]
    }
  };
  const palettes = {
    'Песок': {color:'#D4C6B4', label:'Тёплый песок'},
    'Шалфей': {color:'#9DAF9F', label:'Шалфей'},
    'Графит': {color:'#586060', label:'Графит'},
    'Орех': {color:'#A17C5D', label:'Орех'}
  };
  const counters = {'Светлый камень':'#E2E0D8','Серый камень':'#A9ABA5','Древесная фактура':'#BA9675'};
  const state = {kind:'Кухня',layout:'Угловая',facade:'Песок',photoUrl:null,photoName:''};
  let toastTimer;
  function toast(message) {const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3800);}
  async function copyText(value) {
    try {
      if(navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(value);
      else {const el=document.createElement('textarea');el.value=value;el.style.cssText='position:fixed;top:-9999px;left:-9999px;opacity:0';document.body.appendChild(el);el.focus();el.select();const result=document.execCommand('copy');el.remove();if(!result)throw new Error('Clipboard not available');}
      toast('Заявка скопирована. Её можно отправить дизайнеру в VK.');
    } catch(e) {toast('Скопировать не удалось. Откройте сайт через HTTPS или localhost.');}
  }
  // Mobile menu
  const menuToggle=$('#nav-toggle'); const mobileNav=$('#mobile-nav');
  function closeMenu(){mobileNav.hidden=true;menuToggle.setAttribute('aria-expanded','false');}
  menuToggle.addEventListener('click',()=>{mobileNav.hidden=!mobileNav.hidden;menuToggle.setAttribute('aria-expanded',String(!mobileNav.hidden));});
  $$('#mobile-nav a').forEach(link=>link.addEventListener('click',closeMenu));

  // Portfolio category controls
  $$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
    const filter=button.dataset.filter;
    $$('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    $$('.project-card').forEach(card=>card.hidden=filter!=='all'&&card.dataset.category!==filter);
  }));
  // Modal for grounded case metadata
  const modal=$('#project-modal');let modalReturnFocus=null;
  function openProject(name,trigger){
    const project=projectData[name];if(!project)return;
    modalReturnFocus=trigger;
    $('#modal-eyebrow').textContent=project.kicker;
    $('#modal-title').textContent=project.title;
    $('#modal-desc').textContent=project.description;
    $('#modal-img').src=project.image;
    $('#modal-img').alt=project.imageAlt;
    const specs=$('#modal-specs');specs.replaceChildren();
    project.specs.forEach(([label,value])=>{const item=document.createElement('div');const a=document.createElement('span');const b=document.createElement('span');a.textContent=label;b.textContent=value;item.append(a,b);specs.append(item);});
    $('#modal-cta').dataset.targetKind=project.kind;
    modal.hidden=false;document.body.classList.add('modal-open');$('.modal-close',modal).focus();
  }
  function closeProject(){modal.hidden=true;document.body.classList.remove('modal-open');modalReturnFocus?.focus();}
  $$('[data-project]').forEach(card=>card.addEventListener('click',()=>openProject(card.dataset.project,card)));
  $$('[data-modal-close]').forEach(el=>el.addEventListener('click',closeProject));
  $('#modal-cta').addEventListener('click',()=>{const selected=$('#modal-cta').dataset.targetKind;closeProject();selectKind(selected);});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){if(!modal.hidden)closeProject();closeMenu();}if(event.key==='Tab'&&!modal.hidden){const focusable=$$('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled])',modal).filter(el=>el.getClientRects().length);if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}});

  // Interactive schematic and project enquiry
  function setPressed(selector,target){$$(selector).forEach(button=>button.setAttribute('aria-pressed',String(button===target)));}
  function updatePreview(){
    const preview=$('.builder-preview');
    preview.style.setProperty('--facade',palettes[state.facade].color);
    preview.style.setProperty('--counter',counters[$('#countertop').value]);
    ['Кухня','Шкаф','Прихожая','Гардеробная'].forEach((kind,i)=>{
      const ids=['preview-kitchen','preview-wardrobe','preview-hallway','preview-dressing'];
      const elem=$('#'+ids[i]);elem.setAttribute('visibility',state.kind===kind?'visible':'hidden');
    });
    $('#layout-group').hidden=state.kind!=='Кухня';
    $('.toggle-line').hidden=state.kind!=='Кухня';
    $('#kitchen-left').setAttribute('visibility',state.layout==='Прямая'?'hidden':'visible');
    $('#kitchen-right').setAttribute('visibility',state.layout==='П-образная'?'visible':'hidden');
    const appliance=$('#kitchen-appliance');if(appliance)appliance.setAttribute('visibility',$('#appliances').checked?'visible':'hidden');
    $('#preview-title').textContent=state.kind==='Кухня'?`${state.layout} кухня`:state.kind;
    $('#preview-color').textContent=palettes[state.facade].label;
    $('#project-size-label').textContent=Number($('#project-size').value).toFixed(1).replace('.',',')+' м';
  }
  function selectKind(kind){if(!['Кухня','Шкаф','Прихожая','Гардеробная'].includes(kind))return;state.kind=kind;const button=$(`[data-kind="${kind}"]`);if(button)setPressed('[data-kind]',button);updatePreview();}
  $$('[data-kind]').forEach(button=>button.addEventListener('click',()=>selectKind(button.dataset.kind)));
  $$('[data-target-kind]').forEach(link=>link.addEventListener('click',()=>selectKind(link.dataset.targetKind)));
  $$('[data-layout]').forEach(button=>button.addEventListener('click',()=>{state.layout=button.dataset.layout;setPressed('[data-layout]',button);updatePreview();}));
  $$('[data-facade]').forEach(button=>button.addEventListener('click',()=>{state.facade=button.dataset.facade;setPressed('[data-facade]',button);updatePreview();}));
  $('#project-size').addEventListener('input',updatePreview);
  $('#countertop').addEventListener('change',updatePreview);
  $('#appliances').addEventListener('change',updatePreview);
  // Add an SVG appliance group with DOM methods rather than inserting remote images.
  const applianceGroup=document.createElementNS('http://www.w3.org/2000/svg','g');applianceGroup.setAttribute('id','kitchen-appliance');
  const stove=document.createElementNS('http://www.w3.org/2000/svg','path');stove.setAttribute('d','M390 222 448 207');stove.setAttribute('fill','none');stove.setAttribute('stroke','#424848');stove.setAttribute('stroke-width','6');stove.setAttribute('stroke-linecap','round');
  const burner=document.createElementNS('http://www.w3.org/2000/svg','path');burner.setAttribute('d','M403 218v-8m31 0v-8');burner.setAttribute('fill','none');burner.setAttribute('stroke','#E9E8E0');burner.setAttribute('stroke-width','2');
  applianceGroup.append(stove,burner);$('#preview-kitchen').append(applianceGroup);
  updatePreview();
  // Local photo preview (never uploaded)
  const photoInput=$('#room-photo');
  function clearPhoto(){photoInput.value='';if(state.photoUrl)URL.revokeObjectURL(state.photoUrl);state.photoUrl=null;state.photoName='';$('#photo-img').removeAttribute('src');$('#photo-preview').hidden=true;$('#photo-title').textContent='Добавить фото помещения';}
  photoInput.addEventListener('change',()=>{
    const file=photoInput.files?.[0];if(!file){clearPhoto();return;}
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)){clearPhoto();toast('Можно выбрать только JPG, PNG или WebP.');return;}
    if(file.size>8*1024*1024){clearPhoto();toast('Для предпросмотра выберите фотографию до 8 МБ.');return;}
    if(state.photoUrl)URL.revokeObjectURL(state.photoUrl);
    state.photoUrl=URL.createObjectURL(file);state.photoName=file.name;
    $('#photo-img').src=state.photoUrl;$('#photo-preview').hidden=false;$('#photo-title').textContent=file.name;
  });
  $('#photo-remove').addEventListener('click',clearPhoto);
  window.addEventListener('pagehide',()=>{if(state.photoUrl)URL.revokeObjectURL(state.photoUrl);});
  $('#copy-project').addEventListener('click',()=>{
    const length=Number($('#project-size').value).toFixed(1).replace('.',',');
    const note=$('#project-note').value.trim();
    const content=[
      'Здравствуйте! Хотелось бы получить предварительный расчёт мебели в компании «Твоя Кухня».',
      'Город: Липецк.',
      `Тип изделия: ${state.kind}.`,
      ...(state.kind==='Кухня'?[`Планировка: ${state.layout}.`]:[]),
      `Ориентировочная длина: ${length} м.`,
      `Цвет фасадов: ${palettes[state.facade].label}.`,
      `Желаемая отделка столешницы: ${$('#countertop').value}.`,
      `Бюджет: ${$('#budget').value}.`,
      ...(state.kind==='Кухня'?[`Места под встроенную технику: ${$('#appliances').checked?'да':'нет'}.`]:[]),
      ...(note?[`Пожелания: ${note}`]:[]),
      ...(state.photoName?['Есть фото помещения, прикреплю его в переписке отдельно.']:[]),
      'Подскажите, пожалуйста, возможность изготовления, ориентировочную стоимость, доступные материалы и условия замера. Спасибо!'
    ].join('\n');
    copyText(content);
  });
  // Reveal with graceful fallback
  const revealItems=$$('.reveal');
  if('IntersectionObserver' in window&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.06,rootMargin:'0px 0px 70px 0px'});
    revealItems.forEach(node=>observer.observe(node));
  } else revealItems.forEach(node=>node.classList.add('is-visible'));
})();
