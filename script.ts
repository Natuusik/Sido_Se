// Объявляем глобальный объект supabase, загруженный из CDN в HTML
declare const supabase: any;

const SUPABASE_URL = 'https://vuppdvlpsbyzhcmalhoi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_frIjzGAOaW77jegazxN-_Q_OUqN-hzO';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const TABLE_NAME = 'sidose_tasks'; // Должно точно совпадать с названием в Supabase!


let items: any[] = [];
let lastUpdateTime = new Date();

// Форматирование названия (если нужно убрать лишние теги или привести к виду)
function formatTitle(title: string): string {
  return title || '';
}

// Рендер даты в шапке (если используется)
function renderHeaderDate() {
  const dateEl = document.getElementById('header-date');
  if (dateEl) {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString('ru-RU', options);
  }
}

// Рендер времени последнего обновления
function renderLastUpdateTime() {
  const timeEl = document.getElementById('last-update-time');
  if (timeEl) {
    timeEl.textContent = lastUpdateTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
}

// Загрузка данных из Supabase
async function fetchItemsFromSupabase() {
  const { data, error } = await supabaseClient
    .from(TABLE_NAME)
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Ошибка загрузки данных:', error.message);
    return;
  }

  items = data || [];
  renderDashboard();
  renderLastUpdateTime();
}

// Главная функция отрисовки дашборда и таблиц
function renderDashboard() {
  const dashboardContainer = document.getElementById('dashboard-container');
  if (!dashboardContainer) return;

  dashboardContainer.innerHTML = '';

  // 2. Секции таблиц
  const targetSections = [
    { 
      key: 'ready', 
      title: '✅ Completed Goods', 
      bgClass: 'bg-emerald-50 border-emerald-300 shadow-xl shadow-stone-200/50', 
      badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
    },
    { 
      key: 'process', 
      title: '🛠️ In Progress', 
      bgClass: 'bg-blue-50 border-blue-300 shadow-xl shadow-stone-200/50', 
      badgeClass: 'bg-blue-100 text-blue-800 border border-blue-300' 
    }
  ];

  targetSections.forEach(section => {
    const groupItems = items.filter(item => item.status === section.key);
    
    const sectionDiv = document.createElement('div');
    sectionDiv.id = `${section.key}-section`;
    sectionDiv.className = `rounded-3xl p-6 md:p-8 border mb-8 ${section.bgClass}`;
    
    const actionButtonsHtml = groupItems.length > 0
      ? `<div class="flex items-center gap-2 no-print w-full sm:w-auto">
          <button id="print-${section.key}-table" class="flex-1 sm:flex-none bg-stone-800 hover:bg-stone-900 text-white text-xs px-3.5 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-1.5"><span>🖨️ Print / PDF</span></button>
          <button id="copy-${section.key}-table" class="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-1.5"><span>📋 To Word</span></button>
         </div>`
      : '';

    let tableContent = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 class="text-lg md:text-xl font-bold text-stone-900 flex items-center flex-wrap gap-2">
          <span>${section.title}</span>
          <span class="text-xs px-3 py-1 rounded-full font-semibold ${section.badgeClass}">${groupItems.length} items</span>
        </h2>
        ${actionButtonsHtml}
      </div>
    `;

    if (groupItems.length === 0) {
      tableContent += `<p class="text-stone-400 text-sm italic py-2">No items in this category.</p>`;
    } else {
      tableContent += `<div class="space-y-3">`;

      groupItems.forEach((item, index) => {
        const actionButton = section.key === 'process' 
          ? `<button class="move-to-ready-btn bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors shadow-sm flex items-center space-x-1" data-id="${item.id}"><span>✅ Done</span></button>`
          : `<span class="text-xs text-emerald-700 font-semibold bg-emerald-100 px-3 py-2 rounded-xl">Finished</span>`;

        const text = `${item.title} ${item.code}`.toUpperCase();
        let borderAccentClass = 'border-l-stone-300';
        
        if (text.indexOf('END PAPER') !== -1) {
          borderAccentClass = 'border-l-sky-500 hover:bg-sky-50/50';
        } else if (text.indexOf('BXT') !== -1) {
          borderAccentClass = 'border-l-red-500 hover:bg-red-50/50';
        } else if (text.indexOf('FM') !== -1) {
          borderAccentClass = 'border-l-emerald-500 hover:bg-emerald-50/50';
        } else if (text.indexOf('INKJET') !== -1 || text.indexOf('LAZER') !== -1 || text.indexOf('LASER') !== -1) {
          borderAccentClass = 'border-l-purple-500 hover:bg-purple-50/50';
        }

        const currentBoxes = item.boxes || 0;

        tableContent += `
          <div draggable="true" data-id="${item.id}" class="draggable-row flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-white rounded-2xl border border-stone-200/80 border-l-4 ${borderAccentClass} shadow-sm transition-all hover:shadow-md gap-4">
            
            <!-- Левая часть: Номер, PDF и название (адаптивная колонка) -->
            <div class="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto flex-1">
              <div class="flex items-center space-x-3">
                <span class="text-stone-300 hover:text-stone-500 cursor-grab select-none text-base" title="Drag to reorder">⠿</span>
                <span class="text-stone-400 font-bold text-xs w-6 text-center bg-stone-100 py-1 rounded-lg">${index + 1}</span>
                <a href="${item.pdfUrl}" target="_blank" title="Open PDF" class="group flex items-center space-x-2 bg-stone-50 hover:bg-blue-50 px-3 py-1.5 rounded-xl border border-stone-200 transition-colors">
                  <span class="font-mono font-bold text-blue-600 text-sm">${item.code}</span>
                  <span class="text-xs text-stone-400 group-hover:text-blue-600">📄 PDF</span>
                </a>
              </div>

              <div class="font-medium text-stone-800 text-sm md:text-base w-full md:w-auto pl-0 md:pl-2">
                ${formatTitle(item.title)}
              </div>
            </div>

            <!-- Центральная часть: Ручной ввод коробок + Автоматический подсчет -->
            <div class="flex items-center gap-2 w-full md:w-auto justify-start md:justify-center bg-stone-50 px-3 py-2 rounded-xl border border-stone-200">
              <span class="text-xs text-stone-500 font-medium">Коробок:</span>
              <input type="number" min="0" value="${currentBoxes}" data-id="${item.id}" 
                class="boxes-input w-16 px-2 py-1 text-xs font-bold text-stone-900 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-blue-500 text-center" 
                placeholder="0">
              <span class="text-xs text-stone-400">×</span>
              <span class="text-xs text-stone-600 font-semibold">шт =</span>
              <span class="text-xs font-extrabold text-blue-600 total-output min-w-[35px] text-right">${currentBoxes} шт</span>
            </div>

            <!-- Правая часть с кнопками действий -->
            <div class="flex items-center justify-end space-x-2 w-full md:w-auto no-print pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
              ${actionButton}
              <button class="delete-btn bg-stone-50 hover:bg-rose-50 text-stone-400 hover:text-rose-600 border border-stone-200 p-2 rounded-xl text-xs transition-colors shadow-xs" data-id="${item.id}" title="Delete item">🗑️</button>
            </div>
          </div>
        `;
      });

      tableContent += `</div>`;
    }

    sectionDiv.innerHTML = tableContent;
    dashboardContainer.appendChild(sectionDiv);
  });
}

// Глобальные обработчики событий (вешаются один раз)

// 1. Мгновенный пересчет на экране при вводе
document.addEventListener('input', (e) => {
  const target = e.target as HTMLElement;
  if (target && target.classList.contains('boxes-input')) {
    const input = target as HTMLInputElement;
    const row = input.closest('.draggable-row');
    const boxes = Number(input.value) || 0;

    const totalOutput = row?.querySelector('.total-output');
    if (totalOutput) {
      totalOutput.textContent = `${boxes} шт`;
    }
  }
});

// 2. Сохранение количества коробок в Supabase при изменении
document.addEventListener('change', async (e) => {
  const target = e.target as HTMLElement;
  if (target && target.classList.contains('boxes-input')) {
    const input = target as HTMLInputElement;
    const id = Number(input.getAttribute('data-id'));
    const boxes = Number(input.value) || 0;

    const { error } = await supabaseClient
      .from(TABLE_NAME)
      .update({ boxes: boxes })
      .eq('id', id);

    if (error) {
      console.error('Ошибка сохранения коробок:', error.message);
    }
  }
});

// 3. Обработчик кликов по кнопкам (удаление и перевод в готовые)
document.addEventListener('click', async (e) => {
  const target = e.target as HTMLElement;
  
  // Кнопка удаления
  const deleteBtn = target.closest('.delete-btn');
  if (deleteBtn) {
    const id = Number(deleteBtn.getAttribute('data-id'));
    const { error } = await supabaseClient.from(TABLE_NAME).delete().eq('id', id);
    if (!error) {
      await fetchItemsFromSupabase();
    } else {
      console.error('Ошибка удаления:', error.message);
    }
  }

  // Кнопка перевода в Готовые (Done)
  const moveToReadyBtn = target.closest('.move-to-ready-btn');
  if (moveToReadyBtn) {
    const id = Number(moveToReadyBtn.getAttribute('data-id'));
    const { error } = await supabaseClient.from(TABLE_NAME).update({ status: 'ready' }).eq('id', id);
    if (!error) {
      await fetchItemsFromSupabase();
    } else {
      console.error('Ошибка обновления статуса:', error.message);
    }
  }
});

// 4. Обработчик отправки формы добавления нового товара
const addItemForm = document.getElementById('add-item-form') as HTMLFormElement;
if (addItemForm) {
  addItemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const codeInput = document.getElementById('product-code') as HTMLInputElement;
    const titleInput = document.getElementById('product-title') as HTMLInputElement;

    const code = codeInput.value.trim();
    const title = titleInput.value.trim();

    if (!code || !title) return;

    const newItem = {
      id: Date.now(),
      code: code,
      title: title,
      status: 'process' as const,
      pdfUrl: `./docs/${code}.pdf`,
      boxes: 0
    };

    const { error } = await supabaseClient.from(TABLE_NAME).insert([newItem]);
    if (error) {
      console.error('Error inserting item:', error.message);
      alert('Ошибка сохранения в Supabase: ' + error.message);
    } else {
      codeInput.value = '';
      titleInput.value = '';
      lastUpdateTime = new Date();
      renderLastUpdateTime();
      await fetchItemsFromSupabase();
    }
  });
}

// Инициализация при старте страницы
renderHeaderDate();
renderLastUpdateTime();
fetchItemsFromSupabase();