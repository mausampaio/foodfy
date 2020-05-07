const cards = document.querySelectorAll('.card');
const toggleIngredients = document.querySelector('.toggle-ingredients');
const togglePreparation = document.querySelector('.toggle-preparation');
const toggleInfo = document.querySelector('.toggle-info');
const ingredient = document.querySelector(".add-ingredient");
const preparation = document.querySelector(".add-preparation");

if (cards != null) {
    for (let card of cards) {
        card.addEventListener("click", function(){
            const recipeID = card.getAttribute("id");
            window.location.href = `/recipes/${recipeID}`;
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
  
  