function startApp() {

    const result = document.querySelector('#result');
    const selectCategories = document.querySelector('#categories');
   
    if (selectCategories) {
        selectCategories.addEventListener('change', selectCategorie);
        getCategories();
    }
    const favoritesDiv = document.querySelector('.favorites');
    if (favoritesDiv) {
        getFavorites();
    }

    const modal = new bootstrap.Modal('#modal', {});

    

    function getCategories() {
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';
        fetch(url)
            .then(answer => answer.json())
            .then(result => showCategories(result.categories))
    }

    function showCategories(categories = []) {
        console.log(categories);
        categories.forEach(categorie => {
            const option = document.createElement('OPTION');
            option.value = categorie.strCategory;
            option.textContent = categorie.strCategory;
            selectCategories.appendChild(option);
        })
    }

    function selectCategorie(e) {
        const categorie = e.target.value;
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categorie}`;
        fetch(url)
            .then(answer => answer.json())
            .then(result => showRecipes(result.meals))
    }

    function showRecipes(recipes = []) {

        cleanHtml(result);

        const heading = document.createElement('H2');
        heading.classList.add('text-center', 'text-black', 'my-5');
        heading.textContent = recipes.length ? 'Results' : 'No Results';
        result.appendChild(heading);
        
        // in results Iterieren
        recipes.forEach(recipe => {
            const { idMeal, strMeal, strMealThumb } = recipe;

            const recipeContainer = document.createElement('DIV');
            recipeContainer.classList.add('col-md-4');

            const recipeCard = document.createElement('DIV');
            recipeCard.classList.add('card', 'mb-4');

            const recipeImage = document.createElement('IMG');
            recipeImage.classList.add('card-img-top');
            recipeImage.alt = `Image de la recipe ${strMeal ?? recipe.title}`;
            recipeImage.src = strMealThumb ?? recipe.img;
                
            const recipeCardBody = document.createElement('DIV');
            recipeCardBody.classList.add('card-body');

            const recipeHeading = document.createElement('H3');
            recipeHeading.classList.add('card-title', 'mb-3');
            recipeHeading.textContent = strMeal ?? recipe.title;

            const recipeButton = document.createElement('BUTTON');
            recipeButton.classList.add('btn', 'btn-danger', 'w-100');
            recipeButton.textContent = 'See Recipe';
            //recipeButton.dataset.bsTarget = "#modal";
            //recipeButton.dataset.bsToggle = "modal";
            recipeButton.onclick = function () {
                selectRecipe(idMeal ?? recipe.id);
            }


            // Inyectar en el código HTML
            recipeCardBody.appendChild(recipeHeading);
            recipeCardBody.appendChild(recipeButton);

            recipeCard.appendChild(recipeImage);
            recipeCard.appendChild(recipeCardBody)

            recipeContainer.appendChild(recipeCard);

            result.appendChild(recipeContainer);
        })
    }

    function selectRecipe(id) {
        const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
        fetch(url)
            .then(answer => answer.json())
            .then(result => showRecipeModal(result.meals[0]))
    }

    function showRecipeModal(recipe) {
        
        
        const { idMeal, strInstructions, strMeal, strMealThumb } = recipe;
        
        // add content to modal
        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');

        modalTitle.textContent = strMeal;
        
        modalBody.innerHTML = `
            <img class="img-fluid" src="${strMealThumb}" alt="recipe ${strMeal}" />
            <h3 class="my-3">Instrucciones</h3>
            <p>${strInstructions}</p>
            <h3 class="my-3">Ingredientes y Cantidades</h3>
        `;

        const listGroup = document.createElement('UL');
        listGroup.classList.add('list-group');
        // shows the total of the ingredients
        for(let i = 1; i <= 20; i++ ) {
            if(recipe[`strIngredient${i}`]) {
                const ingredient = recipe[`strIngredient${i}`];
                const total = recipe[`strMeasure${i}`];

                const ingredientLi = document.createElement('LI');
                ingredientLi.classList.add('list-group-item');
                ingredientLi.textContent = `${ingredient} - ${total}`

                listGroup.appendChild(ingredientLi);
            }
        }
        
        modalBody.appendChild(listGroup);
        
        const modalFooter = document.querySelector('.modal-footer');
        cleanHtml(modalFooter);

        // Buttons close and favorite
        const btnFavorite = document.createElement('BUTTON');
        btnFavorite.classList.add('btn', 'btn-danger', 'col');
        btnFavorite.textContent = existStorage(idMeal) ? 'Delete from favorites' : 'Save as favorite';

        
        // localstorage
        btnFavorite.onclick = function () {
            console.log(existStorage(idMeal));
            if(existStorage(idMeal)) {
                deleteFavorite(idMeal);
                btnFavorite.textContent = 'Save as favorite';
                showToast('Successfully deleted');
                return
            }

            addFavorite({
                id: idMeal,
                title: strMeal,
                img: strMealThumb 
            });
            btnFavorite.textContent = 'Delete from favorites';
            showToast('Successfully added');
        }

        const btnCloseModal = document.createElement('BUTTON');
        btnCloseModal.classList.add('btn', 'btn-secondary', 'col');
        btnCloseModal.textContent = 'Close';
        btnCloseModal.onclick = function() {
            modal.hide();
        }

        modalFooter.appendChild(btnFavorite);
        modalFooter.appendChild(btnCloseModal);

        // shows modal
        modal.show();
    }


    function existStorage(id) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
        return favorites.some(favorite => favorite.id === id);
    }

    function addFavorite(recipe) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
        localStorage.setItem('favorites', JSON.stringify([...favorites, recipe]));
    }

    function deleteFavorite(id) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
        const newFavorites = favorites.filter(favorite => favorite.id !== id);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
    }

    function showToast(message) {
        const toastDiv = document.querySelector('#toast');
        const toastBody = document.querySelector('.toast-body');
        const toast = new bootstrap.Toast(toastDiv);
        toastBody.textContent = message;
        toast.show();
    }

    function getFavorites() {
        const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
        if(favorites.length) {
            showRecipes(favorites);
            return
        } 

        const noFavorites = document.createElement('P');
        noFavorites.textContent = 'No favorites founded';
        noFavorites.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5');
        favoritesDiv.appendChild(noFavorites);
    }



    function cleanHtml(selector) {
            while(selector.firstChild) {
                selector.removeChild(selector.firstChild);
            }
    }
}



document.addEventListener('DOMContentLoaded', startApp);