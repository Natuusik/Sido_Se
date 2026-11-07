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
  status: 'ready' | 'process' | 'boxes'; // <--- ОБЯЗАТЕЛЬНО должны быть перечислены все три через вертикальную черту
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

  // Обработчик отправки формы добавления
  const addItemForm = document.getElementById('add-item-form') as HTMLFormElement;
  if (addItemForm) {
    addItemForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const cInput = document.getElementById('product-code') as HTMLInputElement;
      const tInput = document.getElementById('product-title') as HTMLInputElement;

      const code = cInput.value.trim();
      const title = tInput.value.trim();

      if (!code || !title) return;

      const newItem = {
        id: Date.now(),
        code: code,
        title: title,
        status: 'process' as const,
        pdfUrl: `./docs/${code}.pdf`,
        quantity: 1,  // Значение по умолчанию для количества
        multiplier: 100 // Значение по умолчанию для множителя
      };

      const { error } = await supabaseClient.from(TABLE_NAME).insert([newItem]);
      if (error) {
        console.error('Error inserting item:', error.message);
        alert('Ошибка сохранения в Supabase: ' + error.message);
      } else {
        cInput.value = '';
        tInput.value = '';
        lastUpdateTime = new Date();
        renderLastUpdateTime();
        await fetchItemsFromSupabase();
      }
    });
  }

  // 2. Только две секции (Completed Goods и In Progress)
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
    const count = groupItems.length;
    
    // Считаем общую сумму по секции (количество * множитель для каждого товара)
    const totalSum = groupItems.reduce((acc, item: any) => {
      const q = Number(item.quantity) || 1;
      const m = Number(item.multiplier) ?? 100;
      return acc + (q * m);
    }, 0);
    
    const sectionDiv = document.createElement('div');
    sectionDiv.id = `${section.key}-section`;
    sectionDiv.className = `rounded-3xl p-6 md:p-8 border mb-8 ${section.bgClass}`;

    const actionButtonsHtml = count > 0
      ? `<div class="flex items-center space-x-2 no-print">
          <button id="print-${section.key}-table" class="bg-stone-800 hover:bg-stone-900 text-white text-xs px-3.5 py-2 rounded-xl font-medium transition-colors shadow-sm flex items-center space-x-1"><span>🖨️ Print / PDF</span></button>
          <button id="copy-${section.key}-table" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-2 rounded-xl font-medium transition-colors shadow-sm flex items-center space-x-1"><span>📋 To Word</span></button>
        </div>`
      : '';

    let tableContent = `
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-stone-900 flex items-center space-x-3">
          <span>${section.title}</span>
          <span class="text-xs px-3 py-1 rounded-full font-semibold ${section.badgeClass}">
            ${count} items (Total: ${totalSum})
          </span>
        </h2>
        ${actionButtonsHtml}
      </div>
    `;

    if (count === 0) {
      tableContent += `<p class="text-stone-400 text-sm italic py-2">No items in this category.</p>`;
    } else {
      tableContent += `<div class="space-y-3">`;

      groupItems.forEach((item: any, index) => {
        let actionButton = '';
        if (section.key === 'process') {
          actionButton = `<button class="move-to-ready-btn bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors shadow-sm flex items-center space-x-1" data-id="${item.id}"><span>✅ Done</span></button>`;
        } else {
          actionButton = `<span class="text-xs text-emerald-700 font-semibold bg-emerald-100 px-3 py-2 rounded-xl">Finished</span>`;
        }

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

        const currentQty = item.quantity ?? 1;
        const currentMultiplier = item.multiplier ?? 100;
        const rowTotal = currentQty * currentMultiplier;

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
            <div class="flex items-center space-x-3 w-full sm:w-auto justify-end">
              <!-- Интерактивные поля ввода: Количество и Множитель -->
              <div class="flex items-center space-x-1.5 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
                <input type="number" min="1" value="${currentQty}" data-id="${item.id}" data-field="quantity" class="item-calc-input w-12 text-center bg-white border border-stone-300 rounded-lg text-xs py-1 focus:outline-none focus:border-blue-500 font-mono font-bold" />
                <span class="text-xs font-semibold text-stone-600">×</span>
                <input type="number" value="${currentMultiplier}" data-id="${item.id}" data-field="multiplier" class="item-calc-input w-14 text-center bg-white border border-stone-300 rounded-lg text-xs py-1 focus:outline-none focus:border-blue-500 font-mono font-bold" />
                <span class="text-xs font-semibold text-stone-600">= <span class="text-blue-600 font-bold">${rowTotal}</span></span>
              </div>
              <div class="flex items-center space-x-2 no-print pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                ${actionButton}
                <button class="delete-btn bg-stone-50 hover:bg-rose-50 text-stone-400 hover:text-rose-600 border border-stone-200 p-2 rounded-xl text-xs transition-colors shadow-xs" data-id="${item.id}" title="Delete item">🗑️</button>
              </div>
            </div>
          </div>
        `;
      });

      tableContent += `</div>`;
    }

    sectionDiv.innerHTML = tableContent;
    dashboardContainer.appendChild(sectionDiv);
  });
// Привязка обработчиков для кнопок печати и копирования (Word) по секциям
  targetSections.forEach(section => {
    const printBtn = document.getElementById(`print-${section.key}-table`);
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        // Логика печати секции (или вызов вашей функции печати)
        window.print();
      });
    }
const copyBtn = document.getElementById(`copy-${section.key}-table`);
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        // Собираем все элементы этой секции
        const groupItems = items.filter(item => item.status === section.key);
        
        if (groupItems.length === 0) {
          alert('В этой секции нет данных для копирования.');
          return;
        }

        // Формируем HTML-таблицу для идеальной вставки в Word (без строки ИТОГО)
        let htmlTable = `
          <table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px; width: 100%;">
            <thead>
              <tr style="background-color: #f3f4f6; text-align: left;">
                <th style="padding: 8px; border: 1px solid #d1d5db;">№</th>
                <th style="padding: 8px; border: 1px solid #d1d5db;">Код</th>
                <th style="padding: 8px; border: 1px solid #d1d5db;">Название товара</th>
                <th style="padding: 8px; border: 1px solid #d1d5db; text-align: center;">Количество</th>
                <th style="padding: 8px; border: 1px solid #d1d5db; text-align: center;">Множитель</th>
                <th style="padding: 8px; border: 1px solid #d1d5db; text-align: right;">Итого</th>
              </tr>
            </thead>
            <tbody>
        `;

        groupItems.forEach((item: any, index) => {
          const qty = item.quantity ?? 1;
          const mult = item.multiplier ?? 100;
          const total = qty * mult;

          htmlTable += `
            <tr>
              <td style="padding: 8px; border: 1px solid #d1d5db; text-align: center;">${index + 1}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db; font-family: monospace; font-weight: bold;">${item.code}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${item.title}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db; text-align: center;">${qty}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db; text-align: center;">${mult}</td>
              <td style="padding: 8px; border: 1px solid #d1d5db; text-align: right; font-weight: bold;">${total}</td>
            </tr>
          `;
        });

        htmlTable += `
            </tbody>
          </table>
        `;

        // Копируем таблицу в буфер обмена для Word
        const clipboardItem = new ClipboardItem({
          "text/html": new Blob([htmlTable], { type: "text/html" }),
          "text/plain": new Blob([htmlTable.replace(/<[^>]*>?/gm, '')], { type: "text/plain" })
        });

        navigator.clipboard.write([clipboardItem]).then(() => {
          alert(`Таблица секции "${section.title}" успешно скопирована! Теперь вставьте ее в Word (Ctrl + V).`);
        }).catch(err => {
          console.error('Ошибка при копировании:', err);
          alert('Не удалось скопировать таблицу.');
        });
      });
    }
  });

  // Привязка событий для обоих полей (quantity и multiplier)
  document.querySelectorAll('.item-calc-input').forEach(input => {
    input.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement;
      const id = Number(target.getAttribute('data-id'));
      const field = target.getAttribute('data-field'); // 'quantity' или 'multiplier'
      const val = Number(target.value) || 0;

      // Обновляем локально в массиве
      const targetItem: any = items.find(i => i.id === id);
      if (targetItem && field) {
        targetItem[field] = val;
      }

      // Сохраняем в Supabase
      try {
        const updateObj: any = {};
        updateObj[field!] = val;
        await supabaseClient.from(TABLE_NAME).update(updateObj).eq('id', id);
      } catch (err) {
        console.error('Error updating in Supabase:', err);
      }

      // Перерисовываем дашборд для обновления расчетов
      renderDashboard();
    });
  });
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