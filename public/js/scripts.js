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

const PhotosUpload = {
    input: "",
    preview: document.querySelector('#photos-preview'),
    uploadLimit: 5,
    files: [],
    handleFileInput(event) {
        const {files: filelist} = event.target;
        PhotosUpload.input = event.target;

        if (PhotosUpload.hasLimit(event)) return;

        Array.from(filelist).forEach( file => {
            PhotosUpload.files.push(file);

            const reader = new FileReader();

            reader.onload = () => {
                const image = new Image();
                image.src = String(reader.result);

                const div = PhotosUpload.getContainer(image);

                PhotosUpload.preview.appendChild(div);
            };

            reader.readAsDataURL(file);
        });

        PhotosUpload.input.files = PhotosUpload.getAllFiles();
    },
    hasLimit(event) {
        const {uploadLimit, input, preview} = PhotosUpload;
        const {files: filelist} = input;

        if (filelist.length > uploadLimit) {
            alert(`Envie no máximo ${uploadLimit} fotos`);
            event.preventDefault();
            return true;
        };

        const photoDiv = [];
        preview.childNodes.forEach(item => {
            if (item.classList && item.classList.value == "photo") {
                photoDiv.push(item);
            };
        });

        const totalPhotos = filelist.length + photoDiv.length;
        if (totalPhotos > uploadLimit) {
            alert(`Você atingiu o máximo de fotos`);
            event.preventDefault();
            return true;
        };
        return false;
    },
    getAllFiles() {
        const dataTranfer = new ClipboardEvent("").clipboardData || new DataTransfer();

        PhotosUpload.files.forEach(file => dataTranfer.items.add(file));

        return dataTranfer.files;
    },
    getContainer(image) {
        const div = document.createElement('div');
        
        div.classList.add('photo');
        div.onclick = PhotosUpload.removePhoto;
        div.appendChild(image);

        div.appendChild(PhotosUpload.getRemoveButton());

        return div;
    },
    getRemoveButton() {
        const button = document.createElement('i');
        button.classList.add('material-icons');
        button.innerHTML = "delete";
        return button;
    },
    removePhoto(event) {
        const photoDiv = event.target.parentNode;
        const photosArray = Array.from(PhotosUpload.preview.children);
        const index = photosArray.indexOf(photoDiv);

        PhotosUpload.files.splice(index, 1);
        PhotosUpload.input.files = PhotosUpload.getAllFiles();

        photoDiv.remove();
    },
    removeOldPhoto(event) {
        const photoDiv = event.target.parentNode;

        if (photoDiv.id) {
            const removedFiles = document.querySelector('input[name="removed_files"]');
            if (removedFiles) {
                removedFiles.value += `${photoDiv.id},`;
            };
        };

        photoDiv.remove();
    }
};

const ImageGallery = {
    highlight: document.querySelector('.gallery .highlight > img'),
    previews: document.querySelectorAll('.gallery-preview img'),
    setImage(event) {
        const {target} = event;

        ImageGallery.previews.forEach(preview => preview.classList.remove('active'));
        target.classList.add('active');

        ImageGallery.highlight.src = target.src;
        Lightbox.image.src = target.src;
    }
};

const AvatarUpload = {
    avatar: document.querySelector('#avatar-preview img'),
    removedFiles: document.querySelector('input[name="removed_files"]'),
    handleAvatarInput(event) {
        if (AvatarUpload.avatar.id != "") {
            AvatarUpload.removedFiles.value = AvatarUpload.avatar.id;
        };

        console.log(AvatarUpload.avatar);
        

        const {files: filelist} = event.target;

        const reader = new FileReader();

        console.log(AvatarUpload.avatar);
        

        reader.onload = () => {
            AvatarUpload.avatar.src = String(reader.result);
        };

        reader.readAsDataURL(filelist[0]);
    }
};

const Validate = {
    apply(input, func) {  
        Validate.clearErrors(input);

        let results = input.value = Validate[func](input.value);
        input.value = results.value;
        
        if (results.error) Validate.displayError(input, results.error);

    },
    displayError(input, error) {
        const div = document.createElement('div');
        div.classList.add('error');
        div.innerHTML = error;
        input.parentNode.appendChild(div);
        input.focus();
    },
    clearErrors(input) {
        const errorDiv = input.parentNode.querySelector(".error");
        if (errorDiv) errorDiv.remove();
    },
    isEmail(value) {
        let error = null;

        const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

        if (!value.match(mailFormat)) error = "Email inválido";

        return {
            error,
            value
        };
    }
};