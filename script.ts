// Объявляем глобальный объект supabase, загруженный из CDN в HTML
declare const supabase: any;

const SUPABASE_URL = 'https://vuppdvlpsbyzhcmalhoi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_frIjzGAOaW77jegazxN-_Q_OUqN-hzO';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const TABLE_NAME = 'sidose_tasks'; // Должно точно совпадать с названием в Supabase!

interface CatalogItem {
  code: string;
  title: string;
  pdfUrl: string;
}

interface ProductionItem extends CatalogItem {
  id: number;
  status: 'ready' | 'process';
}

const catalogDatabase: CatalogItem[] = [
  { code: "714002", title: "End Paper A4 Portrait White", pdfUrl: "./docs/714002.pdf" },
  { code: "714003", title: "End Paper A4 Landscape White", pdfUrl: "./docs/doc-2.pdf" },
  { code: "7714021", title: "End Paper A4 Portrait HD White End papers", pdfUrl: "./docs/7714021.pdf" },
  { code: "714005", title: "End Paper A4 Landscape Color", pdfUrl: "./docs/doc-4.pdf" },
  { code: "732008", title: "BXT Letter Portrait White", pdfUrl: "./docs/732008.pdf" },
  { code: "792008", title: "Inkjet 329x530", pdfUrl: "./docs/792008.pdf" },
  { code: "792007", title: "Lazer 329x500", pdfUrl: "./docs/792007.pdf" },
  { code: "734007", title: "BXT A4 Portrait Black", pdfUrl: "./docs/doc-6.pdf" }
];

let items: ProductionItem[] = [];
let lastUpdateTime: Date = new Date();

const dashboardContainer = document.getElementById('dashboard-container');

function renderHeaderDate(): void {
  const dateContainer = document.getElementById('current-date');
  if (!dateContainer) return;

  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const today = new Date().toLocaleDateString('en-US', options);
  dateContainer.innerText = today.charAt(0).toUpperCase() + today.slice(1);
}

function renderLastUpdateTime(): void {
  const timeContainer = document.getElementById('last-update-time');
  if (!timeContainer) return;

  const now = lastUpdateTime;
  const hours = ('0' + now.getHours()).slice(-2);
  const minutes = ('0' + now.getMinutes()).slice(-2);
  const seconds = ('0' + now.getSeconds()).slice(-2);

  timeContainer.innerText = `Updated: ${hours}:${minutes}:${seconds}`;
}

function formatTitle(title: string): string {
  return title.replace(/black/gi, function(match) {
    return `<span style="font-style: italic; text-decoration: underline;">${match}</span>`;
  });
}

// Загрузка данных из Supabase
async function fetchItemsFromSupabase() {
  try {
    const { data, error } = await supabaseClient.from(TABLE_NAME).select('*');
    if (error) {
      console.error('Supabase error:', error.message);
    } else if (data) {
      items = data as ProductionItem[];
    }
  } catch (err) {
    console.error('Fetch exception:', err);
  } finally {
    renderDashboard();
  }
}

function renderDashboard(): void {
  if (!dashboardContainer) return;

  dashboardContainer.innerHTML = '';

  // 1. Форма добавления задачи
  const addFormContainer = document.createElement('div');
  addFormContainer.id = 'add-item-form-container';
  addFormContainer.className = 'bg-white rounded-2xl p-6 mb-8 border border-stone-200 shadow-md';
  addFormContainer.innerHTML = `
    <h3 class="text-lg font-bold text-stone-900 mb-4 flex items-center space-x-2">
      <span>➕ Add Item to Work</span>
    </h3>
    <form id="add-item-form" class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
      <div class="md:col-span-4">
        <label class="block text-xs font-semibold text-stone-600 mb-1">Code</label>
        <input type="text" id="product-code" list="code-list" placeholder="Enter code..." class="w-full bg-stone-50 border border-stone-300 text-stone-800 text-sm rounded-xl p-2.5 focus:outline-none focus:border-blue-500" required />
        <datalist id="code-list">
          ${catalogDatabase.map(item => `<option value="${item.code}">${item.title}</option>`).join('')}
        </datalist>
      </div>
      <div class="md:col-span-6">
        <label class="block text-xs font-semibold text-stone-600 mb-1">Title (or select from database)</label>
        <input type="text" id="product-title" list="title-list" placeholder="Product title..." class="w-full bg-stone-50 border border-stone-300 text-stone-800 text-sm rounded-xl p-2.5 focus:outline-none focus:border-blue-500" required />
        <datalist id="title-list">
          ${catalogDatabase.map(item => `<option value="${item.title}">${item.code}</option>`).join('')}
        </datalist>
      </div>
      <div class="md:col-span-2">
        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs py-2.5 px-3 rounded-xl transition-colors shadow-sm whitespace-nowrap">Add Item</button>
      </div>
    </form>
  `;
  
  dashboardContainer.appendChild(addFormContainer);

  // Автосвязка полей Кода и Названия
  const codeInput = document.getElementById('product-code') as HTMLInputElement;
  const titleInput = document.getElementById('product-title') as HTMLInputElement;

  if (codeInput && titleInput) {
    codeInput.addEventListener('input', () => {
      const found = catalogDatabase.find(i => i.code === codeInput.value.trim());
      if (found) {
        titleInput.value = found.title;
      }
    });

    titleInput.addEventListener('input', () => {
      const found = catalogDatabase.find(i => i.title === titleInput.value.trim());
      if (found) {
        codeInput.value = found.code;
      }
    });
  }

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
      ? `<div class="flex items-center space-x-2 no-print">
          <button id="print-${section.key}-table" class="bg-stone-800 hover:bg-stone-900 text-white text-xs px-3.5 py-2 rounded-xl font-medium transition-colors shadow-sm flex items-center space-x-1"><span>🖨️ Print / PDF</span></button>
          <button id="copy-${section.key}-table" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-2 rounded-xl font-medium transition-colors shadow-sm flex items-center space-x-1"><span>📋 To Word</span></button>
        </div>`
      : '';

    let tableContent = `
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-stone-900 flex items-center space-x-3">
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

        tableContent += `
          <div draggable="true" data-id="${item.id}" class="draggable-row flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-2xl border border-stone-200/80 border-l-4 ${borderAccentClass} shadow-sm transition-all hover:shadow-md cursor-grab active:cursor-grabbing gap-4">
            <div class="flex items-center space-x-3 w-full sm:w-auto">
              <span class="text-stone-300 hover:text-stone-500 cursor-grab select-none text-base" title="Drag to reorder">⠿</span>
              <span class="text-stone-400 font-bold text-xs w-6 text-center bg-stone-100 py-1 rounded-lg">${index + 1}</span>
              <a href="${item.pdfUrl}" target="_blank" title="Open PDF" class="group flex items-center space-x-2 bg-stone-50 hover:bg-blue-50 px-3 py-1.5 rounded-xl border border-stone-200 transition-colors">
                <span class="font-mono font-bold text-blue-600 text-sm">${item.code}</span>
                <span class="text-xs text-stone-400 group-hover:text-blue-600">📄 PDF</span>
              </a>
              <div class="font-medium text-stone-800 text-sm md:text-base flex-1 sm:flex-none">
                ${formatTitle(item.title)}
              </div>
            </div>
            <div class="flex items-center justify-end space-x-2 w-full sm:w-auto no-print pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
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

  // Обработчик отправки формы добавления
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
        pdfUrl: `./docs/${code}.pdf`
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
}

// Инициализация при старте
renderHeaderDate();
renderLastUpdateTime();
renderDashboard();
fetchItemsFromSupabase();

// Обработка кликов по кнопкам (Done и Delete)
if (dashboardContainer) {
  dashboardContainer.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;

    const doneBtn = target.closest('.move-to-ready-btn');
    if (doneBtn) {
      const idStr = doneBtn.getAttribute('data-id');
      if (idStr) {
        const itemId = Number(idStr);
        const { error } = await supabaseClient
          .from(TABLE_NAME)
          .update({ status: 'ready' })
          .eq('id', itemId);

        if (error) {
          console.error('Error updating status:', error);
        } else {
          lastUpdateTime = new Date();
          renderLastUpdateTime();
          await fetchItemsFromSupabase();
        }
      }
    }

    const deleteBtn = target.closest('.delete-btn');
    if (deleteBtn) {
      const idStr = deleteBtn.getAttribute('data-id');
      if (idStr) {
        const itemId = Number(idStr);
        const { error } = await supabaseClient
          .from(TABLE_NAME)
          .delete()
          .eq('id', itemId);

        if (error) {
          console.error('Error deleting item:', error);
        } else {
          lastUpdateTime = new Date();
          renderLastUpdateTime();
          await fetchItemsFromSupabase();
        }
      }
    }
  });
}