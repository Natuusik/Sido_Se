// ==========================================
// 1. Инициализация и настройки Supabase
// ==========================================
declare const supabase: any;

const SUPABASE_URL = 'https://vuppdvlpsbyzhcmalhoi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_frIjzGAOaW77jegazxN-_Q_OUqN-hzO';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const TABLE_NAME = 'sidose_tasks';

// Элементы интерфейса
const refreshButton = document.getElementById('refresh-btn') as HTMLButtonElement | null;
const lastUpdateDiv = document.getElementById('last-update-time') as HTMLElement | null;

interface CatalogItem {
  code: string;
  title: string;
  pdfUrl: string;
}

interface ProductionItem extends CatalogItem {
  id: number;
  status: 'ready' | 'process' | 'boxes';
  quantity?: number;
  multiplier?: number;
}

const catalogDatabase: CatalogItem[] = [
  { code: "714002", title: "End Paper A4 Portrait White", pdfUrl: "./docs/714002.pdf" },
  { code: "714003", title: "End Paper A4 Landscape White", pdfUrl: "./docs/714003.pdf" },
  { code: "714004", title: "End Paper A3 Portrait White", pdfUrl: "./docs/714004.pdf" },
  { code: "714005", title: "End Paper Letter Portrait White", pdfUrl: "./docs/714005.pdf" },
  { code: "714006", title: "End Paper Letter Landscape White", pdfUrl: "./docs/714006.pdf" },
  { code: "714007", title: "End Paper 305x305 Square White", pdfUrl: "./docs/714007.pdf" },
  { code: "714008", title: "End Paper Ledger Portrait White", pdfUrl: "./docs/714008.pdf" },
  { code: "714011", title: "End Paper A4 Portrait Black", pdfUrl: "./docs/714011.pdf" },
  { code: "714012", title: "End Paper A4 landscape Black", pdfUrl: "./docs/714012.pdf" },
  { code: "714013", title: "End Paper A3 Portrait Black", pdfUrl: "./docs/714013.pdf" },
  { code: "714014", title: "End Paper Letter Portrait Black", pdfUrl: "./docs/714014.pdf" },
  { code: "714016", title: "End Paper 305x305 Square Black", pdfUrl: "./docs/714016.pdf" },
  { code: "732008", title: "BXT Letter Portrait White", pdfUrl: "./docs/732008.pdf" },
];
let items: ProductionItem[] = [];
let lastUpdateTime: Date | null = null; // Общее время из базы для всех устройств

const dashboardContainer = document.getElementById('dashboard-container');

// ==========================================
// 2. Вспомогательные функции рендеринга
// ==========================================
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

// Вспомогательная функция для добавления ведущего нуля (работает везде без padStart)
function pad(n: number): string {
  return n < 10 ? '0' + n : String(n);
}

function renderLastUpdateTime(): void {
  const timeContainer = document.getElementById('last-update-time');
  if (!timeContainer) return;

  if (!lastUpdateTime) {
    timeContainer.innerText = 'Updated: ---';
    return;
  }

  const d = lastUpdateTime as any;

  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();

  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());

  // Выводим полную дату и время (ДД.ММ.ГГГГ ЧЧ:ММ:СС)
  timeContainer.innerText = `Updated: ${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
}

function formatTitle(title: string): string {
  return title.replace(/black/gi, function(match) {
    return `<span style="font-style: italic; text-decoration: underline;">${match}</span>`;
  });
}

// ==========================================
// 3. Работа с Supabase (Загрузка задач + Общее время)
// ==========================================
async function fetchItemsFromSupabase(): Promise<void> {
  try {
    // 1. Загружаем задачи
    const { data: taskData, error: taskError } = await supabaseClient.from(TABLE_NAME).select('*');
    if (taskError) {
      console.error('Supabase tasks error:', taskError.message);
    } else if (taskData) {
      items = taskData as ProductionItem[];
    }

    // 2. Подгружаем последнее время из базы app_settings для всех устройств
    const { data: timeData, error: timeError } = await supabaseClient
      .from('app_settings')
      .select('last_update_time')
      .eq('id', 1)
      .single();

    if (!timeError && timeData && timeData.last_update_time) {
      lastUpdateTime = new Date(timeData.last_update_time);
    } else {
      lastUpdateTime = null;
    }

  } catch (err) {
    console.error('Fetch exception:', err);
  } finally {
    renderDashboard();
    renderLastUpdateTime();
  }
}

// Глобальная функция для кнопки "Done"
(window as any).markAsReady = async function(itemId: number) {
  try {
    const { error } = await supabaseClient
      .from(TABLE_NAME)
      .update({ status: 'ready' })
      .eq('id', itemId);

    if (error) {
      console.error('Ошибка Supabase:', error);
      alert('Не удалось обновить статус: ' + error.message);
    } else {
      await fetchItemsFromSupabase();
    }
  } catch (err) {
    console.error('Ошибка в markAsReady:', err);
  }
};

// ==========================================
// 4. Отрисовка дашборда и Drag-and-Drop
// ==========================================
function renderDashboard(): void {
  if (!dashboardContainer) return;

  dashboardContainer.innerHTML = '';

  // Форма добавления задачи
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
      if (found) titleInput.value = found.title;
    });

    titleInput.addEventListener('input', () => {
      const found = catalogDatabase.find(i => i.title === titleInput.value.trim());
      if (found) codeInput.value = found.code;
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
        quantity: 1,
        multiplier: 100
      };

      const { error } = await supabaseClient.from(TABLE_NAME).insert([newItem]);
      if (error) {
        console.error('Error inserting item:', error.message);
        alert('Ошибка сохранения в Supabase: ' + error.message);
      } else {
        cInput.value = '';
        tInput.value = '';
        await fetchItemsFromSupabase();
      }
    });
  }

  // Секции (Completed Goods и In Progress)
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
    
    const sectionDiv = document.createElement('div');
    sectionDiv.id = `${section.key}-section`;
    sectionDiv.className = `rounded-3xl p-4 md:p-8 border mb-8 ${section.bgClass}`;

    const actionButtonsHtml = count > 0
      ? `<div class="flex flex-wrap items-center gap-2 no-print">
          <button id="print-${section.key}-table" class="bg-stone-800 hover:bg-stone-900 text-white text-xs px-3.5 py-2 rounded-xl font-medium transition-colors shadow-sm flex items-center space-x-1"><span>🖨️ Print / PDF</span></button>
          <button id="copy-${section.key}-table" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-2 rounded-xl font-medium transition-colors shadow-sm flex items-center space-x-1"><span>📋 To Word</span></button>
        </div>`
      : '';

    let tableContent = `
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div class="flex items-center space-x-3">
          <h2 class="text-lg md:text-xl font-bold text-stone-900">${section.title}</h2>
          <span class="text-xs px-3 py-1 rounded-full font-semibold ${section.badgeClass}">${count} items</span>
        </div>
        ${actionButtonsHtml}
      </div>
    `;

    if (count === 0) {
      tableContent += `<p class="text-stone-400 text-sm italic py-2">No items in this category.</p>`;
    } else {
      tableContent += `<div class="space-y-3 task-list-container" data-section="${section.key}">`;

      groupItems.forEach((item: any, index) => {
        let actionButton = '';
        if (section.key === 'process') {
          actionButton = `<button onclick="markAsReady(${item.id})" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-semibold transition-colors shadow-sm shrink-0">✅ Done</button>`;
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
          <div draggable="true" data-id="${item.id}" class="draggable-row flex flex-col xl:flex-row items-start xl:items-center justify-between p-4 bg-white rounded-2xl border border-stone-200/80 border-l-4 ${borderAccentClass} shadow-sm transition-all hover:shadow-md gap-4 cursor-grab active:cursor-grabbing">
            <div class="flex items-center space-x-3 w-full xl:w-auto overflow-hidden">
              <span class="text-stone-300 hover:text-stone-500 select-none text-base hidden sm:inline" title="Drag to reorder">⠿</span>
              <span class="text-stone-400 font-bold text-xs w-6 text-center bg-stone-100 py-1 rounded-lg shrink-0">${index + 1}</span>
              <a href="${item.pdfUrl}" target="_blank" title="Open PDF" class="group flex items-center space-x-1.5 bg-stone-50 hover:bg-blue-50 px-3 py-1.5 rounded-xl border border-stone-200 transition-colors shrink-0">
                <span class="font-mono font-bold text-blue-600 text-sm">${item.code}</span>
                <span class="text-xs text-stone-400 group-hover:text-blue-600">📄</span>
              </a>
              <div class="font-medium text-stone-800 text-sm md:text-base leading-snug truncate xl:truncate-none">
                ${formatTitle(item.title)}
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-between xl:justify-end gap-3 w-full xl:w-auto pt-3 xl:pt-0 border-t xl:border-t-0 border-stone-100 shrink-0">
              <div class="flex items-center space-x-1.5 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
                <input type="number" min="1" value="${currentQty}" data-id="${item.id}" data-field="quantity" class="item-calc-input w-12 text-center bg-white border border-stone-300 rounded-lg text-xs py-1 focus:outline-none focus:border-blue-500 font-mono font-bold" />
                <span class="text-xs font-semibold text-stone-500">×</span>
                <input type="number" value="${currentMultiplier}" data-id="${item.id}" data-field="multiplier" class="item-calc-input w-16 text-center bg-white border border-stone-300 rounded-lg text-xs py-1 focus:outline-none focus:border-blue-500 font-mono font-bold" />
                <span class="text-xs font-semibold text-stone-600">= <span class="text-blue-600 font-bold">${rowTotal}</span></span>
              </div>

              <div class="flex items-center space-x-2 no-print">
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

  // Логика Drag-and-Drop (перетаскивание строк)
  let draggedItem: HTMLElement | null = null;

  document.querySelectorAll('.draggable-row').forEach(row => {
    row.addEventListener('dragstart', () => {
      draggedItem = row as HTMLElement;
      setTimeout(() => row.classList.add('opacity-40'), 0);
    });

    row.addEventListener('dragend', () => {
      if (draggedItem) draggedItem.classList.remove('opacity-40');
      draggedItem = null;
    });

    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      const container = row.closest('.task-list-container');
      if (!container || !draggedItem) return;

      const afterElement = getDragAfterElement(container, (e as DragEvent).clientY);
      if (afterElement == null) {
        container.appendChild(draggedItem);
      } else {
        container.insertBefore(draggedItem, afterElement);
      }
    });

    row.addEventListener('drop', async (e) => {
      e.preventDefault();
      const container = row.closest('.task-list-container');
      if (!container) return;

      const newOrderIds = Array.from(container.querySelectorAll('.draggable-row')).map(r => Number(r.getAttribute('data-id')));
      
      const sectionKey = container.getAttribute('data-section');
      const otherItems = items.filter(i => i.status !== sectionKey);
      const reorderedSectionItems = newOrderIds.map(id => items.find(i => i.id === id)).filter(Boolean) as ProductionItem[];

      items = [...otherItems, ...reorderedSectionItems];
    });
  });

  function getDragAfterElement(container: Element, y: number) {
    const draggableElements = Array.from(container.querySelectorAll('.draggable-row:not(.opacity-40)'));

    return draggableElements.reduce((closest: { offset: number; element: Element | null }, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
  }

  // Привязка кнопок удаления
  const currentContainer = document.getElementById('dashboard-container');
  if (currentContainer) {
    currentContainer.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.getAttribute('data-id'));
        if (!id) return;
        
        const { error } = await supabaseClient.from(TABLE_NAME).delete().eq('id', id);
        if (error) {
          console.error('Error deleting item:', error);
        } else {
          await fetchItemsFromSupabase();
        }
      });
    });
  }

  // Привязка кнопок печати и копирования в Word
 // Привязка кнопок печати и копирования в Word
targetSections.forEach(section => {
  const printBtn = document.getElementById(`print-${section.key}-table`);
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      // Находим блок секции (ищем по ID секции или берем ближайший родительский блок/секцию)
      const sectionEl = document.getElementById(`section-${section.key}`) 
                     || document.getElementById(section.key) 
                     || printBtn.closest('section, .card, .section-container, div');

      // Очищаем класс печати у всех остальных элементов на всякий случай
      document.querySelectorAll('.only-print-section').forEach(el => {
        el.classList.remove('only-print-section');
      });

      if (sectionEl) {
        // Добавляем класс, который разрешает отображение при печати
        sectionEl.classList.add('only-print-section');

        // Запускаем печать
        window.print();

        // Убираем класс после закрытия окна печати (с небольшой задержкой для надежности)
        setTimeout(() => {
          sectionEl.classList.remove('only-print-section');
        }, 500);
      } else {
        alert('Не удалось найти блок секции для печати.');
      }
    });
  }

  const copyBtn = document.getElementById(`copy-${section.key}-table`);
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const groupItems = items.filter(item => item.status === section.key);
      if (groupItems.length === 0) {
        alert('В этой секции нет данных для копирования.');
        return;
      }

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

      groupItems.forEach((item, index) => {
        const qty = item.quantity ?? 1;
        const mult = item.multiplier ?? 100;
        const total = qty * mult; // Исправлен знак умножения

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

      htmlTable += `</tbody></table>`;

      const clipboardItem = new ClipboardItem({
        "text/html": new Blob([htmlTable], { type: "text/html" }),
        "text/plain": new Blob([htmlTable.replace(/<[^>]*>?/gm, '')], { type: "text/plain" })
      });

      navigator.clipboard.write([clipboardItem]).then(() => {
        alert(`Таблица секции "${section.title}" успешно скопирована! Вставьте в Word (Ctrl + V).`);
      }).catch(err => {
        console.error('Ошибка копирования:', err);
        alert('Не удалось скопировать таблицу.');
      });
    });
  }
});


  // Привязка инпутов калькулятора
  document.querySelectorAll('.item-calc-input').forEach(input => {
    input.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement;
      const id = Number(target.getAttribute('data-id'));
      const field = target.getAttribute('data-field');
      const val = Number(target.value) || 0;

      const targetItem: any = items.find(i => i.id === id);
      if (targetItem && field) {
        targetItem[field] = val;
      }

      try {
        const updateObj: any = {};
        updateObj[field!] = val;
        await supabaseClient.from(TABLE_NAME).update(updateObj).eq('id', id);
      } catch (err) {
        console.error('Error updating in Supabase:', err);
      }

      renderDashboard();
    });
  });
}

// ==========================================
// 5. Логика кнопки "Refresh"
// ==========================================
async function handleRefreshClick(): Promise<void> {
  const refreshBtn = document.getElementById('refresh-btn') as HTMLButtonElement | null;
  if (refreshBtn) {
    refreshBtn.disabled = true;
    refreshBtn.style.opacity = '0.6';
  }

  const now = new Date();

  try {
    // 1. Отправляем точную дату и время в таблицу app_settings в Supabase
    const { error } = await supabaseClient
      .from('app_settings')
      .update({ last_update_time: now.toISOString() })
      .eq('id', 1);

    if (error) {
      console.error('Ошибка сохранения времени в базу:', error);
      alert('Не удалось обновить время в базе. Проверьте консоль (F12).');
    } else {
      // 2. Обновляем локально и выводим на экран
      lastUpdateTime = now;
      renderLastUpdateTime();
    }

    // 3. Подгружаем актуальные данные задач
    const { data: taskData, error: taskError } = await supabaseClient.from(TABLE_NAME).select('*');
    if (taskError) {
      console.error('Ошибка загрузки задач:', taskError.message);
    } else if (taskData) {
      items = taskData;
      renderDashboard();
    }

  } catch (err) {
    console.error('Ошибка рефреша:', err);
  } finally {
    if (refreshBtn) {
      refreshBtn.disabled = false;
      refreshBtn.style.opacity = '1';
    }
  }
}

// Привязываем клик к кнопке
if (refreshButton) {
  refreshButton.addEventListener('click', handleRefreshClick);
}

// ==========================================
// 6. Запуск при старте страницы
// ==========================================
renderHeaderDate();
fetchItemsFromSupabase();