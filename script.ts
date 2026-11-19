// ==========================================
// 1. Инициализация и настройки Supabase
// ==========================================
export {}; // Требуется для module: commonjs
declare const supabase: any;

const SUPABASE_URL = 'https://vuppdvlpsbyzhcmalhoi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_frIjzGAOaW77jegazxN-_Q_OUqN-hzO';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const TABLE_NAME = 'sidose_tasks';
const ARCHIVE_TABLE_NAME = 'shipment_archives';

// Элементы интерфейса
const refreshButton = document.getElementById('refresh-btn') as HTMLButtonElement | null;
const lastUpdateDiv = document.getElementById('last-update-time') as HTMLElement | null;

interface CatalogItem {
  code: string;
  title: string;
  pdfUrl: string;
  pdfUrl2?: string;
}

interface ProductionItem extends CatalogItem {
  id: number;
  status: 'ready' | 'process' | 'deleted';
  quantity?: number;
  multiplier?: number;
  note?: string;
  sort_order?: number;
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
 
  { code: "732002", title: "BXT A4 Portrait White", pdfUrl: "./docs/732002.pdf" },
  { code: "732005", title: "BXT A4 Landscape Black", pdfUrl: "./docs/732005.pdf" },
  { code: "732007", title: "BXT Letter Landscape White", pdfUrl: "./docs/732007.pdf" },
  { code: "732008", title: "BXT Letter Portrait White", pdfUrl: "./docs/732008.pdf" },
  { code: "732011", title: "BXT Letter Landscape Black", pdfUrl: "./docs/732011.pdf" },
  { code: "732013", title: "BXT A4 Portrait Black", pdfUrl: "./docs/732013.pdf" },
  { code: "732018", title: "BXT 203x203 Square Black", pdfUrl: "./docs/732018.pdf" },
  { code: "732019", title: "BXT 305x305 Square Black", pdfUrl: "./docs/732019.pdf" },
  { code: "732021", title: "BXT 305x305 Square White", pdfUrl: "./docs/732021.pdf" },
  { code: "732024", title: "BXT Letter Portrait Black", pdfUrl: "./docs/732024.pdf" },
  { code: "732048", title: "BXT Black Special Endsheet 295 x 210 Landscape NSM", pdfUrl: "./docs/732048.pdf" },
  { code: "732053", title: "BXT End sheet white 254 x 254 mm Square White", pdfUrl: "./docs/732053.pdf" },
  { code: "732054", title: "BXT End sheet white 254 x 254 mm Square Black", pdfUrl: "./docs/732054.pdf" },

  { code: "714037", title: "Lazer Printable 329x500 50 pcs", pdfUrl: "./docs/714037.pdf" },
  { code: "714039", title: "Lazer Printable 329x500 500 pcs", pdfUrl: "./docs/714039.pdf", pdfUrl2: "./docs/Laser_329x500_RedLebel.pdf" },
  { code: "714040", title: "Lazer Printable 329x660 250 pcs", pdfUrl: "./docs/714040.pdf" },
  { code: "714106", title: "Lazer Printable Lamifree 329x660 250 pcs", pdfUrl: "./docs/714106.pdf" },
  { code: "714041", title: "Inkjet Printable 329x530 50 pcs", pdfUrl: "./docs/714041.pdf" },
  { code: "714043", title: "Inkjet Printable 329x530 500 pcs", pdfUrl: "./docs/714043.pdf" },
  { code: "714044", title: "Inkjet Printable 329x660 250 pcs", pdfUrl: "./docs/714044.pdf" },

  { code: "714047", title: "Grey Board A4 Portrait 207x302 / 2 mm", pdfUrl: "./docs/714047.pdf" },
  { code: "714048", title: "Grey Board A4 Landscape 294x220 / 2 mm", pdfUrl: "./docs/714048.pdf" },
  { code: "714056", title: "Grey Board A4 Portrait 207x302 / 3 mm", pdfUrl: "./docs/714056.pdf" },
  { code: "714057", title: "Grey Board A4 Landscape 294x220 / 3 mm", pdfUrl: "./docs/714057.pdf" },

  { code: "714306", title: "Casing-In Sheet 24 310 (S) x 480 mm", pdfUrl: "./docs/714306.pdf" },
  { code: "714307", title: "Casing-In Sheet 30 310 (S) x 480 mm", pdfUrl: "./docs/714307.pdf" },

  { code: "721003", title: "FM 333x350 White", pdfUrl: "./docs/721003.pdf" },
  { code: "721011", title: "FM 333x350 White", pdfUrl: "./docs/721011.pdf" },
  { code: "722002", title: "FM 333x230 White", pdfUrl: "./docs/722002.pdf" },
  { code: "722004", title: "FM 333x318 White", pdfUrl: "./docs/722004.pdf" },
  { code: "722006", title: "FM 333x318 White / 850mic", pdfUrl: "./docs/722006.pdf" },
  { code: "721005", title: "FM 333x350 White / 850mic", pdfUrl: "./docs/721005.pdf" },
  { code: "722007", title: "FM 333x230 White", pdfUrl: "./docs/722007.pdf" },
  { code: "722016", title: "FM 440x318 White", pdfUrl: "./docs/722016.pdf" },

  { code: "707072", title: "Replaceable drain pan for ONE series (10 pcs)", pdfUrl: "./docs/707072.pdf" },
  { code: "714020", title: "End Paper Pro HD 220x220mm White", pdfUrl: "./docs/714020.pdf" },
  { code: "714023", title: "End Paper Pro HD Letter Portrait White", pdfUrl: "./docs/714023.pdf" },
  { code: "714187", title: "End Paper A5 White", pdfUrl: "./docs/714187.pdf" },
  { code: "714212", title: "End Paper A4 White - New Material", pdfUrl: "./docs/714212.pdf" },
  { code: "721003_Spesial (230)", title: "SPECIAL FB FM End sheet white 333 x 230 mm / 200 mic", pdfUrl: "./docs/721003_Spesial (230).pdf" },
  { code: "721003_Special (318)", title: "SPECIAL FB FM End sheet white 333 x 318 mm / 200 mic", pdfUrl: "./docs/721003_Special (318).pdf" },
  { code: "722029", title: "FM 210x290 White", pdfUrl: "./docs/722029.pdf" },
  { code: "722036", title: "FM 195x190 White", pdfUrl: "./docs/722036.pdf" },
  { code: "732048_Special", title: "BXT Landscape 295x210 Black", pdfUrl: "./docs/732048_Special.pdf" },
];

let items: ProductionItem[] = [];
let lastUpdateTime: Date | null = null;

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

  timeContainer.innerText = `Updated: ${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
}

async function updateLastModifiedTime(): Promise<void> {
  const now = new Date();
  try {
    const { error } = await supabaseClient
      .from('app_settings')
      .update({ last_update_time: now.toISOString() })
      .eq('id', 1);

    if (error) {
      console.error('Ошибка сохранения времени в базу:', error);
    } else {
      lastUpdateTime = now;
      renderLastUpdateTime();
    }
  } catch (err) {
    console.error('Ошибка при обновлении времени:', err);
  }
}

function formatTitle(title: string): string {
  return title.replace(/black/gi, function(match) {
    return `<span style="font-style: italic; text-decoration: underline;">${match}</span>`;
  });
}

async function fetchItemsFromSupabase(): Promise<void> {
  try {
    const { data: taskData, error: taskError } = await supabaseClient.from(TABLE_NAME).select('*');
    if (taskError) {
      console.error('Supabase tasks error:', taskError.message);
    } else if (taskData) {
      items = taskData as ProductionItem[];
    }

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

(window as any).markAsReady = async function(itemId: number) {
  try {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const readyItems = items.filter(i => i.status === 'ready');
    const maxSortOrder = readyItems.length > 0 
      ? Math.max(...readyItems.map(i => i.sort_order ?? 0)) 
      : -1;
    const newSortOrder = maxSortOrder + 1;

    const { error } = await supabaseClient
      .from(TABLE_NAME)
      .update({ 
        status: 'ready',
        sort_order: newSortOrder 
      })
      .eq('id', itemId);

    if (error) {
      console.error('Ошибка Supabase:', error);
      alert('Не удалось обновить статус: ' + error.message);
    } else {
      await updateLastModifiedTime();
      await fetchItemsFromSupabase();
    }
  } catch (err) {
    console.error('Ошибка в markAsReady:', err);
  }
};

(window as any).undoLastDelete = async function() {
  const deletedItems = items.filter(i => i.status === 'deleted');
  if (deletedItems.length === 0) return;

  const lastDeleted = deletedItems[deletedItems.length - 1];

  try {
    const { error } = await supabaseClient
      .from(TABLE_NAME)
      .update({ status: 'process' })
      .eq('id', lastDeleted.id);

    if (error) {
      console.error('Ошибка отмены удаления:', error);
      alert('Не удалось восстановить позицию: ' + error.message);
    } else {
      await updateLastModifiedTime();
      await fetchItemsFromSupabase();
    }
  } catch (err) {
    console.error('Ошибка в undoLastDelete:', err);
  }
};

(window as any).editItemModal = function(itemId: number) {
  const item = items.find(i => i.id === itemId);
  if (!item) return;

  const newCode = prompt("Редактировать код товара:", item.code);
  if (newCode === null) return;

  const newTitle = prompt("Редактировать название товара:", item.title);
  if (newTitle === null) return;

  const trimmedCode = newCode.trim();
  const trimmedTitle = newTitle.trim();

  if (!trimmedCode || !trimmedTitle) {
    alert("Код и название не могут быть пустыми!");
    return;
  }

  item.code = trimmedCode;
  item.title = trimmedTitle;
  item.pdfUrl = `./docs/${trimmedCode}.pdf`;

  supabaseClient.from(TABLE_NAME)
    .update({ code: trimmedCode, title: trimmedTitle, pdfUrl: item.pdfUrl })
    .eq('id', itemId)
    .then(async ({ error }: { error: any }) => {
      if (error) {
        console.error("Ошибка обновления:", error);
        alert("Не удалось сохранить изменения в базе.");
      } else {
        await updateLastModifiedTime();
      }
      renderDashboard();
    });
};

// ==========================================
// Функция отправки (архивации) готовых товаров
// ==========================================
(window as any).shipCompletedGoods = async function() {
  const readyItems = items.filter(i => i.status === 'ready');
  if (readyItems.length === 0) {
    alert('Нет готовых товаров для отправки!');
    return;
  }

  const batchName = prompt("Введите название или дату отправки (например: Партия от 26.11.2026):", `Отправка ${new Date().toLocaleDateString()}`);
  if (!batchName) return;

  try {
    // 1. Сохраняем в таблицу архива
    const archivePayload = {
      batch_name: batchName.trim(),
      items_json: readyItems,
      total_items: readyItems.length
    };

    const { error: archiveError } = await supabaseClient.from(ARCHIVE_TABLE_NAME).insert([archivePayload]);
    if (archiveError) {
      alert('Ошибка при сохранении в архив: ' + archiveError.message);
      return;
    }

    // 2. Удаляем отправленные товары из основной таблицы задач навсегда (или помечаем)
    for (const item of readyItems) {
      await supabaseClient.from(TABLE_NAME).delete().eq('id', item.id);
    }

    alert('Партия успешно отправлена в архив и очищена с экрана!');
    await updateLastModifiedTime();
    await fetchItemsFromSupabase();

  } catch (err) {
    console.error('Ошибка отправки партии:', err);
    alert('Произошла ошибка при отправке.');
  }
};

// ==========================================
// Открытие модального окна архива отправок
// ==========================================
(window as any).openShipmentArchiveModal = async function() {
  const existingModal = document.getElementById('archive-modal-overlay');
  if (existingModal) existingModal.remove();

  const overlay = document.createElement('div');
  overlay.id = 'archive-modal-overlay';
  overlay.className = 'fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4';
  
  overlay.innerHTML = `
    <div class="bg-white rounded-3xl p-6 md:p-8 max-w-3xl w-full border border-stone-200 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
      <div class="flex items-center justify-between border-b border-stone-100 pb-3">
        <h3 class="text-lg font-bold text-stone-900 flex items-center space-x-2">
          <span>📁 Архив отправок и партий</span>
        </h3>
        <button onclick="document.getElementById('archive-modal-overlay').remove()" class="text-stone-400 hover:text-stone-700 text-lg font-bold px-2 py-1">✕</button>
      </div>
      
      <div id="archive-list-content" class="overflow-y-auto space-y-3 flex-1 pr-1">
        <p class="text-stone-400 text-sm italic text-center py-6">Загрузка архива...</p>
      </div>

      <div class="flex items-center justify-end pt-2 border-t border-stone-100">
        <button onclick="document.getElementById('archive-modal-overlay').remove()" class="bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors">Закрыть</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Загружаем архивы из базы
  try {
    const { data, error } = await supabaseClient.from(ARCHIVE_TABLE_NAME).select('*').order('shipped_at', { ascending: false });
    const contentContainer = document.getElementById('archive-list-content');
    if (!contentContainer) return;

    if (error || !data || data.length === 0) {
      contentContainer.innerHTML = `<p class="text-stone-400 text-sm italic text-center py-6">Архив отправок пуст.</p>`;
      return;
    }

    let html = '';
    data.forEach((batch: any) => {
      const dateFormatted = new Date(batch.shipped_at).toLocaleString();
      const itemsList = batch.items_json || [];

      let itemsTableHtml = '';
      itemsList.forEach((it: any, idx: number) => {
        const rowTotal = (it.quantity ?? 1) * (it.multiplier ?? 100);
        itemsTableHtml += `
          <tr class="border-b border-stone-100 text-xs">
            <td class="py-1.5 px-2 text-center font-bold text-stone-500">${idx + 1}</td>
            <td class="py-1.5 px-2 font-mono font-bold">${it.code}</td>
            <td class="py-1.5 px-2">${it.title}</td>
            <td class="py-1.5 px-2 text-right">${it.quantity ?? 1} × ${it.multiplier ?? 100}</td>
            <td class="py-1.5 px-2 text-right font-bold text-blue-600">${rowTotal}</td>
          </tr>
        `;
      });

      html += `
        <div class="border border-stone-200 rounded-2xl p-4 bg-stone-50/50 space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/60 pb-2">
            <div>
              <h4 class="font-bold text-stone-900 text-sm">${batch.batch_name}</h4>
              <p class="text-xs text-stone-500">Дата отправки: ${dateFormatted} | Позиций: ${batch.total_items}</p>
            </div>
            <button onclick="printArchiveBatch(${batch.id})" class="bg-stone-800 hover:bg-stone-900 text-white text-xs px-3 py-1.5 rounded-xl font-medium transition-colors shadow-sm self-start sm:self-auto">🖨️ Печать / PDF отчета</button>
          </div>
          <table class="w-full text-left bg-white rounded-xl overflow-hidden border border-stone-200">
            <thead class="bg-stone-100 text-[11px] text-stone-600 uppercase">
              <tr>
                <th class="py-1.5 px-2 text-center w-8">№</th>
                <th class="py-1.5 px-2 w-24">Code</th>
                <th class="py-1.5 px-2">Title</th>
                <th class="py-1.5 px-2 text-right w-24">Calculation</th>
                <th class="py-1.5 px-2 text-right w-20">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsTableHtml}
            </tbody>
          </table>
        </div>
      `;
    });

    contentContainer.innerHTML = html;

    // Сохраняем данные архива глобально для печати
    (window as any).cachedArchiveData = data;

  } catch (err) {
    console.error('Ошибка загрузки архива:', err);
    const contentContainer = document.getElementById('archive-list-content');
    if (contentContainer) {
      contentContainer.innerHTML = `<p class="text-rose-500 text-sm text-center py-6">Ошибка загрузки данных из базы.</p>`;
    }
  }
};

// Функция печати конкретной архивной партии в красивый PDF
(window as any).printArchiveBatch = function(batchId: number) {
  const data = (window as any).cachedArchiveData;
  if (!data) return;

  const batch = data.find((b: any) => b.id === batchId);
  if (!batch) return;

  const dateFormatted = new Date(batch.shipped_at).toLocaleString();
  let tableRowsHtml = '';

  batch.items_json.forEach((it: any, index: number) => {
    const total = (it.quantity ?? 1) * (it.multiplier ?? 100);
    tableRowsHtml += `
      <tr>
        <td class="col-num">${index + 1}</td>
        <td class="col-code">${it.code}</td>
        <td class="col-title">${it.title}</td>
        <td class="col-qty">${it.quantity ?? 1}</td>
        <td class="col-mult">${it.multiplier ?? 100}</td>
        <td class="col-total">${total}</td>
      </tr>
    `;
  });

  let printArea = document.getElementById('custom-print-area');
  if (!printArea) {
    printArea = document.createElement('div');
    printArea.id = 'custom-print-area';
    document.body.appendChild(printArea);
  }

  printArea.innerHTML = `
    <h2>Отчет по отправке: ${batch.batch_name}</h2>
    <p style="font-size: 12px; color: #4b5563; margin-bottom: 10px;">Дата архивации: ${dateFormatted} | Всего позиций: ${batch.total_items}</p>
    <table>
      <thead>
        <tr>
          <th class="col-num">№</th>
          <th class="col-code">Code</th>
          <th class="col-title">Product Title</th>
          <th class="col-qty">Qty</th>
          <th class="col-mult">Mult.</th>
          <th class="col-total">Total</th>
        </tr>
      </thead>
      <tbody>
        ${tableRowsHtml}
      </tbody>
    </table>
  `;

  window.print();
};

// ==========================================
// Модальное окно для заметок
// ==========================================
(window as any).openNoteModal = function(itemId: number) {
  const item = items.find(i => i.id === itemId);
  if (!item) return;

  const existingModal = document.getElementById('note-modal-overlay');
  if (existingModal) existingModal.remove();

  const overlay = document.createElement('div');
  overlay.id = 'note-modal-overlay';
  overlay.className = 'fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4';
  
  overlay.innerHTML = `
    <div class="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full border border-red-200 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
      <div class="flex items-center justify-between border-b border-stone-100 pb-3">
        <h3 class="text-base font-bold text-stone-900 flex items-center space-x-2">
          <span class="w-3 h-3 rounded-full bg-rose-600 inline-block"></span>
          <span>Заметка к позиции: <span class="text-rose-600 font-mono">${item.code}</span></span>
        </h3>
        <button onclick="document.getElementById('note-modal-overlay').remove()" class="text-stone-400 hover:text-stone-700 text-lg font-bold px-2 py-1">✕</button>
      </div>
      
      <div>
        <p class="text-xs text-stone-500 mb-2 font-medium">${item.title}</p>
        <textarea id="modal-note-text" rows="4" class="w-full bg-rose-50/40 border border-red-300 rounded-2xl p-3 text-sm text-stone-800 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 font-sans" placeholder="Введите текст заметки...">${item.note ?? ''}</textarea>
      </div>

      <div class="flex items-center justify-end space-x-3 pt-2">
        <button onclick="document.getElementById('note-modal-overlay').remove()" class="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors">Отмена</button>
        <button onclick="saveNoteFromModal(${item.id})" class="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-rose-600/30">Сохранить заметку</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  const textarea = document.getElementById('modal-note-text') as HTMLTextAreaElement;
  if (textarea) textarea.focus();
};

(window as any).saveNoteFromModal = async function(itemId: number) {
  const textarea = document.getElementById('modal-note-text') as HTMLTextAreaElement;
  if (!textarea) return;

  const val = textarea.value.trim();
  const targetItem: any = items.find(i => i.id === itemId);
  if (targetItem) {
    targetItem.note = val;
  }

  try {
    await supabaseClient.from(TABLE_NAME).update({ note: val }).eq('id', itemId);
    await updateLastModifiedTime();
    document.getElementById('note-modal-overlay')?.remove();
    renderDashboard();
  } catch (err) {
    console.error('Error updating note in Supabase:', err);
    alert('Не удалось сохранить заметку.');
  }
};

function renderDashboard(): void {
  if (!dashboardContainer) return;

  dashboardContainer.innerHTML = '';

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

  const addItemForm = document.getElementById('add-item-form') as HTMLFormElement;
  if (addItemForm) {
    addItemForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const cInput = document.getElementById('product-code') as HTMLInputElement;
      const tInput = document.getElementById('product-title') as HTMLInputElement;

      const code = cInput.value.trim();
      const title = tInput.value.trim();

      if (!code || !title) return;
      const catalogMatch = catalogDatabase.find(i => i.code === code);
      const resolvedPdfUrl = catalogMatch ? catalogMatch.pdfUrl : `./docs/${code}.pdf`;

      const processItems = items.filter(i => i.status === 'process');
      const maxSortOrder = processItems.length > 0
        ? Math.max(...processItems.map(i => i.sort_order ?? 0))
        : -1;
      const newSortOrder = maxSortOrder + 1;

      const newItem = {
        id: Date.now(),
        code: code,
        title: title,
        status: 'process' as const,
        pdfUrl: resolvedPdfUrl,
        quantity: 1,
        multiplier: 100,
        note: '',
        sort_order: newSortOrder
      };

      const { error } = await supabaseClient.from(TABLE_NAME).insert([newItem]);
      if (error) {
        console.error('Error inserting item:', error.message);
        alert('Ошибка сохранения в Supabase: ' + error.message);
      } else {
        cInput.value = '';
        tInput.value = '';
        await updateLastModifiedTime();
        await fetchItemsFromSupabase();
      }
    });
  }

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

  const hasDeletedItems = items.filter(i => i.status === 'deleted').length > 0;

  targetSections.forEach(section => {
    const groupItems = items
      .filter(item => item.status === section.key)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const count = groupItems.length;
    
    const sectionDiv = document.createElement('div');
    sectionDiv.id = `${section.key}-section`;
    sectionDiv.className = `rounded-3xl p-4 md:p-8 border mb-8 ${section.bgClass}`;

    const undoButtonHtml = hasDeletedItems 
      ? `<button onclick="undoLastDelete()" class="bg-amber-600 hover:bg-amber-700 text-white text-xs px-3.5 py-2 rounded-xl font-medium transition-colors shadow-sm flex items-center space-x-1" title="Вернуть последнее удаление"><span>↩️ Undo</span></button>`
      : '';

    // Если это секция Completed Goods и в ней есть товары, добавляем кнопку "Зафиксировать отправку" и кнопку архива
    let specialActionButtons = '';
    if (section.key === 'ready' && count > 0) {
      specialActionButtons = `<button onclick="shipCompletedGoods()" class="bg-emerald-700 hover:bg-emerald-800 text-white text-xs px-3.5 py-2 rounded-xl font-medium transition-colors shadow-sm flex items-center space-x-1" title="Отправить партию в архив и очистить экран"><span>📦 Зафиксировать отправку</span></button>`;
    }

    // Кнопка доступа ко всем прошлым архивам отправок
    let archiveHistoryBtn = `<button onclick="openShipmentArchiveModal()" class="bg-stone-700 hover:bg-stone-800 text-white text-xs px-3.5 py-2 rounded-xl font-medium transition-colors shadow-sm flex items-center space-x-1" title="Посмотреть архив отправок за месяц"><span>📁 Архив отправок</span></button>`;

    const actionButtonsHtml = `<div class="flex flex-wrap items-center gap-2 no-print">
        ${archiveHistoryBtn}
        ${undoButtonHtml}
        ${specialActionButtons}
        <button id="print-${section.key}-table" class="bg-stone-800 hover:bg-stone-900 text-white text-xs px-3.5 py-2 rounded-xl font-medium transition-colors shadow-sm flex items-center space-x-1"><span>🖨️ Print / PDF</span></button>
        <button id="copy-${section.key}-table" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-2 rounded-xl font-medium transition-colors shadow-sm flex items-center space-x-1"><span>📋 To Word</span></button>
       </div>`;

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
        const hasNote = Boolean(item.note && item.note.trim().length > 0);

        const catalogEntry = catalogDatabase.find(c => c.code === item.code);

        let secondFileHtml = '';
        if (catalogEntry?.pdfUrl2) {
          const isWord = catalogEntry.pdfUrl2.toLowerCase().endsWith('.doc') || catalogEntry.pdfUrl2.toLowerCase().endsWith('.docx');
          const labelText = isWord ? 'Word' : 'Label';
          const icon = isWord ? '📝' : '📄';
          const colorClasses = isWord 
            ? 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-700' 
            : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-600';

          secondFileHtml = `
            <a href="${catalogEntry.pdfUrl2}" target="_blank" title="Open Document" class="group flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border transition-colors shrink-0 ${colorClasses}">
              <span class="font-mono font-bold text-xs">${labelText}</span>
              <span class="text-xs">${icon}</span>
            </a>
          `;
        }

        const noteBtnClass = hasNote 
          ? 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700 shadow-sm' 
          : 'bg-stone-50 text-stone-400 hover:text-rose-600 border-stone-200 hover:bg-rose-50';

        const noteButtonHtml = section.key === 'process' 
          ? `<button onclick="openNoteModal(${item.id})" class="p-2 rounded-xl border text-xs transition-colors shrink-0 ${noteBtnClass}" title="${hasNote ? 'Изменить заметку: ' + item.note : 'Добавить заметку'}">💬</button>`
          : '';

        tableContent += `
          <div data-id="${item.id}" class="draggable-row flex flex-col xl:flex-row items-start xl:items-center justify-between p-4 bg-white rounded-2xl border border-stone-200/80 border-l-4 ${borderAccentClass} shadow-sm transition-all hover:shadow-md gap-4">
            <div class="flex items-center space-x-3 w-full xl:w-auto overflow-hidden">
              <div class="flex flex-col space-y-0.5 no-print">
                <button onclick="moveItemUp(${item.id})" class="text-stone-400 hover:text-stone-700 text-xs px-1" title="Move Up">▲</button>
                <button onclick="moveItemDown(${item.id})" class="text-stone-400 hover:text-stone-700 text-xs px-1" title="Move Down">▼</button>
              </div>
              
              <span class="text-stone-600 font-bold text-xs w-7 h-7 flex items-center justify-center bg-stone-100 border border-stone-200 rounded-lg shrink-0">${index + 1}</span>
              
              <a href="${item.pdfUrl}" target="_blank" title="Open PDF" class="group flex items-center space-x-1.5 bg-stone-50 hover:bg-blue-50 px-3 py-1.5 rounded-xl border border-stone-200 transition-colors shrink-0">
                <span class="font-mono font-bold text-blue-600 text-sm">${item.code}</span>
                <span class="text-xs text-stone-400 group-hover:text-blue-600">📄</span>
              </a>
              ${secondFileHtml}

              <div class="font-medium text-stone-800 text-sm md:text-base leading-snug truncate xl:truncate-none">
                ${formatTitle(item.title)}
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-between xl:justify-end gap-3 w-full xl:w-auto pt-3 xl:pt-0 border-t xl:border-t-0 border-stone-100 shrink-0">
              ${noteButtonHtml}

              <div class="flex items-center space-x-1.5 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
                <input type="number" min="1" value="${currentQty}" data-id="${item.id}" data-field="quantity" class="item-calc-input w-12 text-center bg-white border border-stone-300 rounded-lg text-xs py-1 focus:outline-none focus:border-blue-500 font-mono font-bold" />
                <span class="text-xs font-semibold text-stone-500">×</span>
                <input type="number" value="${currentMultiplier}" data-id="${item.id}" data-field="multiplier" class="item-calc-input w-16 text-center bg-white border border-stone-300 rounded-lg text-xs py-1 focus:outline-none focus:border-blue-500 font-mono font-bold" />
                <span class="text-xs font-semibold text-stone-600">= <span class="text-blue-600 font-bold">${rowTotal}</span></span>
              </div>

              <div class="flex items-center space-x-2 no-print">
                ${actionButton}
                <button onclick="editItemModal(${item.id})" class="bg-stone-50 hover:bg-amber-50 text-stone-400 hover:text-amber-600 border border-stone-200 p-2 rounded-xl text-xs transition-colors shadow-xs" title="Edit item">✏️</button>
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
        await updateLastModifiedTime();
      } catch (err) {
        console.error('Error updating in Supabase:', err);
      }

      renderDashboard();
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const target = e.currentTarget as HTMLButtonElement;
      const id = Number(target.getAttribute('data-id'));
      if (!id) return;

      const item = items.find(i => i.id === id);
      if (!item) return;

      if (!confirm(`Удалить позицию "${item.title}"? (Её можно будет вернуть кнопкой Undo сверху)`)) return;

      try {
        const { error } = await supabaseClient
          .from(TABLE_NAME)
          .update({ status: 'deleted' })
          .eq('id', id);

        if (error) {
          console.error('Ошибка удаления:', error);
          alert('Не удалось удалить: ' + error.message);
        } else {
          item.status = 'deleted';
          await updateLastModifiedTime();
          renderDashboard();
        }
      } catch (err) {
        console.error('Исключение при удалении:', err);
      }
    });
  });
}

(window as any).moveItemUp = async function(itemId: number) {
  const item = items.find(i => i.id === itemId);
  if (!item) return;

  const sectionItems = items
    .filter(i => i.status === item.status)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const index = sectionItems.findIndex(i => i.id === itemId);
  if (index <= 0) return;

  sectionItems.splice(index, 1);
  sectionItems.splice(index - 1, 0, item);

  sectionItems.forEach((it, idx) => {
    it.sort_order = idx;
  });

  const otherItems = items.filter(i => i.status !== item.status);
  items = [...otherItems, ...sectionItems];

  await saveOrderAndRefresh();
};

(window as any).moveItemDown = async function(itemId: number) {
  const item = items.find(i => i.id === itemId);
  if (!item) return;

  const sectionItems = items
    .filter(i => i.status === item.status)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const index = sectionItems.findIndex(i => i.id === itemId);
  if (index === -1 || index >= sectionItems.length - 1) return;

  sectionItems.splice(index, 1);
  sectionItems.splice(index + 1, 0, item);

  sectionItems.forEach((it, idx) => {
    it.sort_order = idx;
  });

  const otherItems = items.filter(i => i.status !== item.status);
  items = [...otherItems, ...sectionItems];

  await saveOrderAndRefresh();
};

async function saveOrderAndRefresh() {
  try {
    for (const item of items) {
      await supabaseClient
        .from(TABLE_NAME)
        .update({ sort_order: item.sort_order })
        .eq('id', item.id);
    }
    await updateLastModifiedTime();
  } catch (err) {
    console.warn('Ошибка сохранения порядка в базу:', err);
  }
  renderDashboard();
}

async function handleRefreshClick(): Promise<void> {
  if (refreshButton) {
    refreshButton.disabled = true;
    refreshButton.style.opacity = '0.6';
  }

  try {
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
    if (refreshButton) {
      refreshButton.disabled = false;
      refreshButton.style.opacity = '1';
    }
  }
}

if (refreshButton) {
  refreshButton.addEventListener('click', handleRefreshClick);
}

renderHeaderDate();
fetchItemsFromSupabase();