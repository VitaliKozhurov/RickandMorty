/*====== ПЕРЕМЕННЫЕ ======*/
let isLoading = false; // Для отслеживания состояния запроса информации, чтобы не отправлять повторные запросы, пока не пришел ответ
let contentIsEnd = false; // В случае, если контент заканчивается, то мы прекращаем отправлять запросы
let numberOfPage = 1; // Номер страницы, для отправки данных на сервер
const url = 'https://rickandmortyapi.com/api/character?page='; // URL API
const toTop = document.querySelector('.toTop'); // Элемент для прокрутки страницы вверх
const mainSection = document.querySelector('.card-list'); // Контент страницы
const script = document.querySelector('script');
const loader = document.querySelector('.preloader');
const pagination = document.querySelector('.pagination');
const ul = document.querySelector('ul');
const totalPages = 42;
const switchBtn = document.querySelector('.switch-btn');

// Запрос к серверу
let getInfo = fetch(url + numberOfPage);
getInfo
   .then(data => data.json())
   .then(data => {
      stopLoader();
      numberOfPage++;
      return data.results.forEach(characterInfo => getCard(characterInfo))
   })
   .catch(err => console.log(err))

// Функция, котрая управляет прелодером
function stopLoader() {
   window.setTimeout(function () {
      loader.classList.add('loaded');
   }, 1000)
}
// Функция, которая будет отслеживать скролл страницы, при достижении определенной точки будем осуществлять запрос к серверу за информацией
function checkPosition() {
   // Если чекбокс выбран для пагинации, то ничего не делаем
   if (switchBtn.classList.contains('switch-on')) return
   const height = window.innerHeight; // Высота видимой части окна браузера
   const scrolled = window.scrollY; // Записываем, сколько пикселей пользователь уже проскроллил
   const pageHeight = document.body.scrollHeight; // Высота всего содержимого страницы
   const limit = pageHeight - height / 4; // Лимит прокрутки контента
   // Отслеживаем, где находится низ экрана относительно страницы:
   const position = scrolled + height;
   if (position >= limit) {
      if (isLoading || contentIsEnd) {
         return
      }
      isLoading = true; // Прекращаем запросы на сервер
      getInfo = fetch(url + numberOfPage);
      loader.classList.remove('loaded');
      getInfo
         .then(data => data.json())
         .then(data => {
            isLoading = false;
            numberOfPage++;
            if (numberOfPage > data.info.pages) {
               contentIsEnd = true
            }
            stopLoader()
            return data.results.forEach(characterInfo => getCard(characterInfo))
         })
         .catch(err => console.log(err))
   }
   if (!toTop.classList.contains('active') && scrolled > height * 3 / 4) {
      toTop.classList.add('active');
   }
   else if (2 * scrolled < height) { toTop.classList.remove('active') }
}

// Описываем функцию, которая будет рендерить контент на странице
function getCard(characterInfo) {

   // Карточка
   const cardBody = document.createElement('div');
   cardBody.classList.add('card-body');
   cardBody.innerHTML = `<p>${characterInfo.name}</p>`;
   const card = document.createElement('div');
   card.classList.add('card');

   // Модальное окно
   const modalWrapper = document.createElement('div');
   modalWrapper.classList.add('modal-wrapper');
   const modalBody = document.createElement('div');
   modalBody.classList.add('modal-body');
   const modalClose = document.createElement('div');
   modalClose.classList.add('close');
   modalClose.innerHTML = '&#10006';
   const modalImg = document.createElement('div');
   modalImg.classList.add('modal-img');
   const infoContainer = document.createElement('div');
   infoContainer.classList.add('info-container');
   const modalInfo = document.createElement('div');
   modalInfo.classList.add('modal-info');
   // Создадим объект, при помощи которго будем наполнять информационное поле
   const characterObj = {
      name: "Name:",
      origin: { name: "Origin:" },
      status: "Status:",
      location: { name: "Location:" },
      species: "Species:",
      gender: "Gender:",
   }
   // Функция, которая будет рендерить информационную часть модального окна
   function setModalInfo(objPerson, objFetch) {
      for (let key in objPerson) {
         if (typeof objPerson[key] !== 'object') {
            modalInfo.innerHTML += `<div class = info-item><h2 class='item-header'>${objPerson[key]}</h2><p class='item-text'>${objFetch[key]}</p></div>`
         }
         else setModalInfo(objPerson[key], objFetch[key])
      }
   }
   setModalInfo(characterObj, characterInfo)

   // Добавляем карточку
   const imageCard = new Image;
   imageCard.src = characterInfo.image;
   card.appendChild(imageCard);
   cardBody.appendChild(card);
   mainSection.appendChild(cardBody)

   // Добавляем модальное окно
   const imageModal = new Image;
   imageModal.src = characterInfo.image;
   modalImg.appendChild(imageModal);
   modalBody.appendChild(modalImg);
   infoContainer.appendChild(modalInfo);
   modalBody.appendChild(modalClose);
   modalBody.appendChild(infoContainer);
   modalWrapper.appendChild(modalBody);
   document.body.insertBefore(modalWrapper, script);

   // Вешаем обработчик, при нажатии на карточку персонажа, будет появляться модальное окно, вместе с тем блокируем scroll на время просмотра карточки
   cardBody.addEventListener('click', () => {
      modalWrapper.classList.add('active');
      document.body.classList.add('lock');
   });
   // Вешаем обработчик, который будет скрывать модальное окно
   modalClose.addEventListener('click', () => {
      modalWrapper.classList.remove('active');
      document.body.classList.remove('lock');
   });
   // Убираем стандартное поведение при нажатии мыши, чтобы убрать ненужное выделение элементов
   window.addEventListener('mousedown', (event) => {
      event.preventDefault()
   })
}

// Функция которая рендерит пагинацию
function setPagination(totalPages, page) {
   if (!switchBtn.classList.contains('switch-on')) return
   // totalPages количество всех страниц
   // page выбранная страница
   let liTag = '';
   let activeLi;
   let beforePages = page - 1;
   let afterPages = page + 1;
   // Если номер выбранной страницы больше 1, то добавляем кнопку PREV
   if (page > 1) {
      liTag += `<li class="btn prev" onclick = "setPagination(totalPages, ${page - 1})">Prev</li>`;
   }

   if (page > 2) {
      liTag += `<li class="numb" onclick = "setPagination(totalPages, 1)">1</li>`;
      if (page > 3) {
         // Если номер страницы болшьше чем 3, то добавляем ..., имитируя пропуск
         liTag += `<li class="dots">...</li>`;
      }
   }

   for (let pageLength = beforePages; pageLength <= afterPages; pageLength++) {
      if (pageLength > totalPages) {
         continue
      }
      if (pageLength === 0) {
         pageLength = pageLength + 1;
      }
      // Описываем, как отрисовываются цифры слева и справа от выбранной, при этом выбранная цифра становится активная
      if (page === pageLength) {
         activeLi = 'active';
      } else {
         activeLi = '';
      }
      liTag += `<li class="numb ${activeLi}" onclick = "setPagination(totalPages, ${pageLength})">${pageLength}</li>`
   }

   if (page < totalPages - 1) {
      // Имитируем пропуск цифр
      if (page < totalPages - 2) {
         liTag += `<li class="dots">...</li>`;
      }
      // Добавляем крайнюю страницу, чтобы можно было быстро перейти к концу списка
      liTag += `<li class="numb" onclick = "setPagination(totalPages, ${totalPages})">${totalPages}</li>`
   }

   if (page < totalPages) {
      liTag += `<li class="btn next" onclick = "setPagination(totalPages, ${page + 1})">Next</li>`;
   }
   ul.innerHTML = liTag;
}

// Обработчик при выборе режима просмотра страницы
switchBtn.addEventListener('click', function () {
   this.classList.toggle('switch-on');
   if (!switchBtn.classList.contains('switch-on')) {
      pagination.classList.add('disable');
   } else {
      pagination.classList.remove('disable');
      mainSection.innerHTML = '';
      numberOfPage = 1;
      getPage();
   }
})

// Вешаем обработчик на собтие скрола страницы
window.addEventListener('scroll', checkPosition);

function getPage() {
   mainSection.innerHTML = '';
   getInfo = fetch(url + numberOfPage);
   loader.classList.remove('loaded');
   getInfo
      .then(data => data.json())
      .then(data => {
         stopLoader()
         return data.results.forEach(characterInfo => {
            getCard(characterInfo);
         })
      })
      .catch(err => console.log(err))
}

// Обработчик, который будет рендерить контент в зависимости от выбранной страницы
ul.addEventListener('click', (event) => {
   if (event.target.classList.contains('numb')) {
      numberOfPage = Number(event.target.textContent);
      getPage()
   }
   if (event.target.classList.contains('prev')) {
      numberOfPage = numberOfPage - 1;
      getPage()
   }
   if (event.target.classList.contains('next')) {
      numberOfPage = numberOfPage + 1;
      getPage()
   }

});
setPagination(42, 1);

// Вешаем обработчик на нажатие кнопки к возврату наверх страницы
toTop.addEventListener('click', (event) => {
   event.preventDefault();
   window.scrollTo({
      top: 10,
      left: 0,
      behavior: "smooth",
   })
})




