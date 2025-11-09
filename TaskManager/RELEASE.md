# Реліз v1.0.0 — Остаточна версія менеджеру завдань

Тег: v1.0.0
Коміт: ace57a5 — "Остаточна версія менеджеру завдань"
Дата: 9 листопада 2025

---

Коротко
- Повнофункціональна локальна веб‑аплікація для управління завданнями (React + TypeScript + Vite + Tailwind).
- Додано: кастомний datepicker з українською локалізацією, імпорт/експорт задач у JSON з валідацією (zod) і preview, стилізація, приклад файлу імпорту.
- Пройшли перевірки: TypeScript (noEmit), ESLint, production build.

---

Повний список змін (функції та покращення)
- UI / UX
  - Заміна нативного `input[type="date"]` на `react-datepicker` з локаллю `uk` (гарантія українських підписів у календарі у всіх браузерах).
  - Стилізація календаря під загальний вигляд застосунку (rounded corners, shadow, зелена тема), додана іконка календаря у формі.
  - Невеликі поліпшення верстки форми додавання завдання (кластери полів, кращі відступи).
- Імпорт/експорт
  - Експорт задач у JSON (скачування файлу).
  - Імпорт JSON з попереднім переглядом (preview modal).
  - Валідація імпортованого JSON через `zod` — точні повідомлення про помилки.
  - Маркування дублікованих задач у preview; опції Merge / Replace; кнопка для видалення дублікатів у preview.
  - Приклад файлу імпорту: `public/sample-tasks.json`.
- Дані та сумісність
  - Нормалізована модель `TaskType`:
    - `id: string`
    - `title: string`
    - `description?: string`
    - `priority: 'low' | 'medium' | 'high'`
    - `dueDate?: string` (ISO)  — раніше було `deadline`
    - `isCompleted: boolean` — раніше було string/`status`
    - `createdAt?: string` (ISO)
  - Міграція localStorage: завантажувач `storage.ts` конвертує старі записи (`deadline`/`status`) у нові поля (`dueDate`, `isCompleted`).
- Інші
  - Lazy‑loading панелі графіків (ChartsPanel) щоб зменшити початковий бандл.
  - Дрібні виправлення TypeScript/ESLint, безпечніші типи для обробки помилок `zod`.
  - Додав sample file і стилі для кращої інтеграції.

---

Файли, що змінились / додані (ключові)
- Додано:
  - `public/sample-tasks.json` — приклад імпорту
- Змінено:
  - `src/components/TaskForm.tsx` — react-datepicker, збереження Date → ISO на сабміті
  - `src/App.css` — overrides для `react-datepicker` (зелені акценти, тіні, rounded)
  - `src/main.tsx` — runtime fallback для `document.documentElement.lang = 'uk'`
  - `src/utils/*` (schema/storage/file) — імпорт/валізація/збереження

---

Міграції / сумісність даних
- Якщо у localStorage є старі завдання з полями `deadline` або `status` — під час завантаження вони автоматично трансформуються в `dueDate` та `isCompleted`.
- Нові завдання зберігаються з `dueDate` як ISO‑рядком (`new Date().toISOString()`).
- Рекомендація при проблемах: експортуйте поточні дані перед оновленням або очистіть localStorage.

---

Перевірки якості, що виконані локально
- TypeScript: `npx tsc --noEmit` — пройшов.
- ESLint: `npm run lint` — пройшов.
- Production build: `npm run build` — Vite зібрав assets успішно.
- Dev server: `npm run dev` — сервер піднявся (у випадку зайнятого порта переключився на інший, наприклад 5174).
- Git: останній коміт зафіксовано і запушено; тег `v1.0.0` створено і запушено.

---

Як запустити (локально, PowerShell)
```powershell
Set-Location -Path 'd:\KursovaRepository\TaskManager'
npm install
npm run dev
```

Після запуску відкрийте URL, який покаже Vite (наприклад `http://localhost:5173`).

---

Як протестувати імпорт файлу
- Використайте кнопку “Імпорт” у UI і вкажіть `public/sample-tasks.json` або файл зі свого комп'ютера.
- Перевірте preview, Merge/Replace, та localStorage після імпорту.

---

Відомі обмеження / зауваження
- `react-datepicker` рендерить власний UI, тому українські підписи контролюються локаллю `date-fns`.
- Форс‑пуш у процесі релізу може потребувати від інших розробників синхронізації (`git fetch` + `git reset --hard origin/main`).

---

Опціональні наступні кроки
- Опублікувати реліз на GitHub з цим описом (потрібен токен або можна вставити вручну через веб‑інтерфейс).
- Додати unit/E2E тести та налаштувати CI.
- Полірування стилів календаря під `tailwind.config.js`.

---

Якщо потрібна допомога з будь‑яким із пунктів вище — напишіть, я допоможу.
