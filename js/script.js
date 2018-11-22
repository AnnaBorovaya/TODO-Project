/**
 ** TODOS
** 1. Добавление задачи
** 2. Удаление задачи
** 3. Редактирование задачи
** Каждое из этих действий - отдельная функция
*/

/**
 ** Одна задача - это объект из следующих полей :
** 1. id - произвольная уникальная строка
** 2. title - заголовок задачи
** 3. text - текст задачи
*/

//**Все задачи(текущие и удаленные)в виде массивов 
//**хранятся в объекте storage
let storage = {
    current_todos: [], //текущие задачи
    deleted_todos: [],  //удалённые задачи
    current_edit_task: {}//редактируемые задачи
}

//*UI Elements
const table = document.querySelector('.table.table-bordered tbody');
const form_col = document.querySelector('.form-col');
const form = document.forms['add-todo-form'];
const input_title = form['title'];
const input_text = form['text'];

//**Events
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if(!input_title.value || !input_text.value) return alert_message('Заполните все поля', 'alert-danger');
    
    if(storage.current_edit_task.id) {
        edit_todo(storage.current_edit_task.id, input_title.value, input_text.value )
        reset_edit_todo(storage.current_edit_task.id);
    } else {
        add_todo(input_title.value, input_text.value);
        form.reset();
        input_text.disabled = true;
    }
});

input_title.addEventListener('keyup', (e) => {
    if (input_title.value) {
        input_text.disabled = !input_title.value;
    }
})

table.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-task')) {
        const id = e.target.closest('tr').dataset.todoId;
        deleted_todo(id);
    }
    if (e.target.classList.contains('edit-task')) {
        const id = e.target.closest('tr').dataset.todoId;
        set_to_edit_todo(id);
    }
    if (e.target.classList.contains('cancel-edit')) {
        const id = e.target.closest('tr').dataset.todoId;
        reset_edit_todo(id)
    }
})
/**
 * generate_id_todo - функция для создания произвольной строки - id
 * @returns {string} - возвращает новый id
 */
const generate_id_todo = () => {
    const words = '0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM'.split(''); 
    const arr = words.map(index => index < 10? words[Math.floor(Math.random() * words.length)]:'');
    return arr.join('')
}

/**
 * add_todo - функция для добавления новой завдачи
 * @param {string} title - заголовок задачи
 * @param {string} text - текст задачи
 */
const add_todo = (title, text) => {
    if (!title) return console.log('Введите заголовок');
    if (!text) return console.log('Введите текст');
    const new_todo = { title, text, id: generate_id_todo() };
    storage.current_todos.push(new_todo);
    add_item_template(new_todo)
    return storage.current_todos;
}

/**
 * add_item_template - функция для вывода новой задачи
 * @param {object} todo - объект задачи со свойствами title и text
 */
const add_item_template = (todo) =>{
    const template = create_todo_template(todo);
    table.insertAdjacentHTML('afterbegin', template);
    alert_message('Задача успешно добавлена', 'alert-success')
}

/**
 * create_todo_template - функция для генерации шаблона-строки необходимой
 * для добавления в html разметку
 * @param {object} todo - объект задачи со свойствами title и text
 */
const create_todo_template = (todo) => {
    return  `
    <tr data-todo-id='${todo.id}'>
        <td class='todo-title'>${todo.title}</td>
        <td class='todo-text'>${todo.text}</td>
        <td>
            <i class="fas fa-trash remove-task"></i>
            <i class="fas fa-edit edit-task"></i>
            <i class="fas fa-times cancel-edit d-none"></i>
        </td>
    </tr>
    `;
}

/**
 * deleted_todo - функция для удаления задачи
 * @param {string} id 
 */
const deleted_todo = id => {
    if (!id) return console.log('Передайте id удаляемой задачи');
    
    const is_confirm = confirm('Удалить задачу?');
    if (!is_confirm) return;
    
    const check_id = storage.current_todos.some(todo => todo.id === id);
    if (!check_id) return console.log('Передайте правильный id задачи')
    
    storage.current_todos = storage.current_todos.filter(item => item.id !== id);
    
    delete_todo_from_html(id);
    
    return storage.current_todos;
}

/**
 * delete_todo_from_html - функция для удаления задачи из HTML
 * @param {string} id 
 */
const delete_todo_from_html = id => {
    const target = document.querySelector(`[data-todo-id='${id}']`);
    const target_parent = target.parentElement;
    target_parent.removeChild(target);
    alert_message('Задача успешно удалена', 'alert-warning');
}

/**
 * alert_message - функция для вывода сообщения об успешности добавления
 * или удаления задачи
 * @param {string} msg 
 * @param {string} class_name 
 */
const alert_message = (msg, class_name) => {
    const curent_alert = form_col.querySelector('.alert');
    if (curent_alert) form_col.removeChild(curent_alert);
    
    const template = alert_template(msg, class_name);
    form_col.insertAdjacentHTML('afterbegin', template);
    
    setTimeout(() => {
        const alert = form_col.querySelector('.alert');
        if(alert) form_col.removeChild(alert);
    },2000);
}

/**
 * alert_template - функция для генерации шаблона сообщения 
 * об успешности добавления или удаления задачи
 * @param {string} msg 
 * @param {string} class_name 
 */
const alert_template = (msg, class_name) => {
    return `
        <div class="alert fixed-top ${class_name}">${msg}</div>
    `;
}

/**
 * edit_todo - функция для редактирования задачи
 * @param {string} id 
 * @param {string} title 
 * @param {string} text 
 */
const edit_todo = (id, title, text ) => {
    if (!id) return console.log('Передайте id редактируемой задачи');
    if (!title) return console.log('Редактируйте заголовок');
    if (!text) return console.log('Редактируйте текст');
    
    const check_id = storage.current_todos.some(todo => todo.id === id);
    if (!check_id) return console.log('Передайте правильный id задачи')
    
    storage.current_todos.forEach(item => {
            if (item.id === id) {
                item.title = title;
                item.text = text;
            }
        }
    )
    edit_todo_template(id, title, text)
    return storage.current_todos;   
}

const edit_todo_template = (id, title, text) => {
    const tr = document.querySelector(`tr[data-todo-id='${id}']`);
    const td_title = tr.querySelector('.todo-title');
    const td_text = tr.querySelector('.todo-text');
    
    td_title.textContent = title;
    td_text.textContent = text;
}


const set_to_edit_todo = id => {
    if (!id) return console.log('Передайте id редактируемой задачи');
   
    storage.current_edit_task = storage.current_todos.find(todo => todo.id === id);
    
    change_view_for_edit(storage.current_edit_task)
}

const change_view_for_edit = todo => {
    input_title.value = todo.title;
    input_text.value = todo.text;
    input_text.disabled = false;
    form['btn'].textContent = 'Edit task';
    const tr = document.querySelector(`tr[data-todo-id='${todo.id}']`);
    tr.querySelector('.edit-task').hidden = true;
    tr.querySelector('.cancel-edit').classList.remove('d-none');
}

const reset_edit_todo = (id) => {
    storage.current_edit_task = {};
    form.reset();
    input_text.disabled = true;
    form['btn'].textContent = 'Add task';
    const tr = document.querySelector(`tr[data-todo-id='${id}']`);
    tr.querySelector('.edit-task').hidden = false;
    tr.querySelector('.cancel-edit').classList.add('d-none');
}


