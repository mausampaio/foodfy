const cards = document.querySelectorAll('.card');

for (let card of cards) {
    card.addEventListener("click", function(){
        const recipeID = card.getAttribute("id");
        window.location.href = `/recipes/${recipeID}`;
    });
};