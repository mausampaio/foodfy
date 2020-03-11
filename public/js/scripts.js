const cards = document.querySelectorAll('.card');
const toggleIngredients = document.querySelector('.toggle-ingredients');
const togglePreparation = document.querySelector('.toggle-preparation');
const toggleInfo = document.querySelector('.toggle-info');

for (let card of cards) {
    card.addEventListener("click", function(){
        const recipeID = card.getAttribute("id");
        window.location.href = `/recipes/${recipeID}`;
    });
};

toggleIngredients.addEventListener("click", function() {
    hide('ingredients', toggleIngredients);
});

togglePreparation.addEventListener('click', function() {
    hide('preparation', togglePreparation); 
});

toggleInfo.addEventListener('click', function() {
    hide('info', toggleInfo);
});

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