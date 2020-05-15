const cards = document.querySelectorAll('.card');
const chefCards = document.querySelectorAll('.chef-card-main');
const toggleIngredients = document.querySelector('.toggle-ingredients');
const togglePreparation = document.querySelector('.toggle-preparation');
const toggleInfo = document.querySelector('.toggle-info');
const ingredient = document.querySelector(".add-ingredient");
const preparation = document.querySelector(".add-preparation");
const currentPage = location.pathname;
const menuItensAdmin = document.querySelectorAll(".header-admin .admin-links a");
const menuItens = document.querySelectorAll(".header .links a");


for (item of menuItensAdmin) {  
    if (currentPage.includes(item.getAttribute("href"))) {
        item.classList.add('admin-link-active');
    };
};

for (item of menuItens) {  
    if (currentPage.includes(item.getAttribute("href"))) {
        item.classList.add('link-active');
    };
};

if (cards != null) {
    for (let card of cards) {
        card.addEventListener("click", function(){
            const recipeID = card.getAttribute("id");
            window.location.href = `/recipes/${recipeID}`;
        });
    };
};

if (chefCards != null) {
    for (let card of chefCards) {
        card.addEventListener("click", function(){
            const recipeID = card.getAttribute("id");
            window.location.href = `/chefs/${recipeID}`;
        });
    };
};

if (toggleIngredients != null) {
    toggleIngredients.addEventListener("click", function() {
        hide('ingredients', toggleIngredients);
    });
};

if (togglePreparation != null) {
    togglePreparation.addEventListener('click', function() {
        hide('preparation', togglePreparation); 
    });
};

if (toggleInfo != null) {
    toggleInfo.addEventListener('click', function() {
        hide('info', toggleInfo);
    });
};

if (ingredient != null) {
    ingredient.addEventListener("click", addIngredient);
};

if (preparation != null) {
    preparation.addEventListener("click", addPreparation);
};


function hide(id, toggle) {
    const element = document.getElementById(id);

    if (element.classList.contains('hide')) {
        element.classList.remove('hide');
        toggle.innerHTML = "ESSCONDER";
    } else {
        element.classList.add('hide');
        toggle.innerHTML = "MOSTRAR";
    };
};

function addIngredient() {
    const ingredients = document.querySelector("#ingredients");
    const fieldContainer = document.querySelectorAll(".ingredient");
  
    // Realiza um clone do último ingrediente adicionado
    const newField = fieldContainer[fieldContainer.length - 1].cloneNode(true);
  
    // Não adiciona um novo input se o último tem um valor vazio
    if (newField.children[0].value == "") return false;
  
    // Deixa o valor do input vazio
    newField.children[0].value = "";
    ingredients.appendChild(newField);
}

function addPreparation() {
    const preparations = document.querySelector("#preparations");
    const fieldContainer = document.querySelectorAll(".preparation");
  
    // Realiza um clone do último ingrediente adicionado
    const newField = fieldContainer[fieldContainer.length - 1].cloneNode(true);
  
    // Não adiciona um novo input se o último tem um valor vazio
    if (newField.children[0].value == "") return false;
  
    // Deixa o valor do input vazio
    newField.children[0].value = "";
    preparations.appendChild(newField);
}
  
function paginate(selectedPage, totalPages) {
    let pages = [],
        oldPage;

    for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
        const fisrtAndLastPage = currentPage == 1 || currentPage == totalPages;
        const pagesAfterSelectedPage = currentPage <= selectedPage + 2;
        const pagesBeforeSelectedPage = currentPage >= selectedPage -2;

        if (fisrtAndLastPage || pagesBeforeSelectedPage && pagesAfterSelectedPage) {
            if (oldPage && currentPage - oldPage > 2) {
                pages.push("...");
            };

            if (oldPage && currentPage - oldPage == 2) {
                pages.push(oldPage + 1);
            };

            pages.push(currentPage);

            oldPage = currentPage;
        };
    };
    return pages;
};

function createPagination(pagination) {
    const page = +pagination.dataset.page;
    const total = +pagination.dataset.total;
    const filter = pagination.dataset.filter;
    const pages = paginate(page, total);

    let elements = "";

    for (let page of pages) {
        if(String(page).includes("...")) {
            elements += `<span>${page}</span>`;
        } else {
            if(filter) {
                elements += `<a href="?page=${page}&filter=${filter}">${page}</a>`;
            } else {
                elements += `<a href="?page=${page}">${page}</a>`;
            };
        };
    };

    pagination.innerHTML = elements;

    const currentSearch = location.search;
    const paginationAtive = document.querySelectorAll(".pagination a");

    console.log(paginationAtive);

    for (let page of paginationAtive) {
        if (currentSearch.includes(page.getAttribute("href"))) {
            page.classList.add('page-active');
        } else {
            if (currentSearch == "" || currentSearch.includes("?filter")) {
                paginationAtive[0].classList.add('page-active');
            };
        };
    };
};

const pagination = document.querySelector(".pagination");

if (pagination) {
    createPagination(pagination);
};