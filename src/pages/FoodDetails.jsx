import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import BlackHartIcon from '../images/blackHeartIcon.svg';
import WhiteHartIcon from '../images/whiteHeartIcon.svg';
import ShareIcon from '../images/shareIcon.svg';

const copy = require('clipboard-copy');

function FoodDetails({ match }) {
  const [mealDetails, setMealDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drinkRecomendation, setDrinkRecomendation] = useState(null);
  const [copied, setCopied] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const { id } = match.params;

  const fetchDetail = async () => {
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      const mealDetailsApi = await response.json();
      setMealDetails(mealDetailsApi.meals[0]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecomendation = async () => {
    try {
      const response = await fetch('https://www.thecocktaildb.com/api/json/v1/1/search.php?s=');
      const drinkRecomendationApi = await response.json();
      setDrinkRecomendation(drinkRecomendationApi.drinks);
    } catch (error) {
      console.error(error);
    }
  };

  const checkFavorite = () => {
    const storageItem = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
    const favoriteFound = storageItem.some((item) => item.id === id);
    if (favoriteFound) setFavorite(true);
  };

  useEffect(() => {
    fetchDetail();
    fetchRecomendation();
    checkFavorite();
  }, []);

  const searchIngredients = (key) => (
    Object.keys(mealDetails)
      .filter((keys) => keys.includes(key))
      .map((ingredients) => mealDetails[ingredients])
  );

  const mealIngredients = () => {
    const ingredients = searchIngredients('strIngredient');
    const measures = searchIngredients('strMeasure');
    return (
      <div>
        {ingredients.map((ingredient, index) => (
          ingredient !== '' && ingredient !== null && (
            <p
              key={ ingredient }
              data-testid={ `${index}-ingredient-name-and-measure` }
            >
              {`${ingredient} - ${measures[index]}`}
            </p>
          )
        ))}
      </div>
    );
  };

  const favorited = () => {
    const type = 'comida';
    const area = mealDetails.strArea;
    const category = mealDetails.strCategory;
    const alcoholicOrNot = '';
    const name = mealDetails.strMeal;
    const image = mealDetails.strMealThumb;
    const storageItem = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
    const favoriteRecipes = [
      ...storageItem, { id, type, area, category, alcoholicOrNot, name, image }];
    const favoriteFound = storageItem.some((item) => item.id === id);
    const unfavorite = storageItem.filter((item) => item.id !== id);
    if (favoriteFound) {
      setFavorite(false);
      localStorage.setItem('favoriteRecipes', JSON.stringify(unfavorite));
    }
    if (!favoriteFound) {
      setFavorite(true);
      localStorage.setItem('favoriteRecipes', JSON.stringify(favoriteRecipes));
    }
  };

  const shareBtn = () => {
    copy(`http://localhost:3000/comidas/${id}`);
    setCopied(true);
  };

  const renderMeal = () => {
    if (mealDetails) {
      return (
        <div className="">
          <header>
            <img
              src={ mealDetails.strMealThumb }
              alt={ mealDetails.strMeal }
              data-testid="recipe-photo"
              className="recipe-photo"
            />
            <h3 data-testid="recipe-title">{mealDetails.strMeal}</h3>
            <button
              className="main-buttons"
              type="button"
              data-testid="share-btn"
              onClick={ shareBtn }
              src="shareIcon"
            >
              { copied ? 'Link copiado!'
                : <img src={ ShareIcon } alt="share" />}
            </button>
            <button
              className="main-buttons"
              type="button"
              data-testid="favorite-btn"
              onClick={ favorited }
              src="blackHeartIcon"
            >
              <img src={ favorite ? BlackHartIcon : WhiteHartIcon } alt="favorite" />
            </button>
            <p data-testid="recipe-category">{mealDetails.strCategory}</p>
          </header>
          <main>
            <h4>Ingredientes</h4>
            {mealIngredients()}
            <h4>Instru????es</h4>
            <p data-testid="instructions">{ mealDetails.strInstructions }</p>
            <h4>Video</h4>
            <iframe
              data-testid="video"
              width="300"
              src={ `https://www.youtube.com/embed/${mealDetails.strYoutube.split('=')[1]}` }
              title={ mealDetails.strMeal }
              frameBorder="0"
              allow="accelerometer;
                autoplay; clipboard-write;
                encrypted-media;
                gyroscope; picture-in-picture"
              allowFullScreen
            />
          </main>
        </div>
      );
    }
  };

  const renderRecomendation = () => {
    const numberSix = 6;
    return (
      <div>
        <h4>Recomendadas</h4>
        <Carousel className="carousel-container">
          {drinkRecomendation.slice(0, numberSix).map((drink, index) => (
            <Carousel.Item
              data-testid={ `${index}-recomendation-card` }
              key={ drink.idDrink }
            >
              <img
                src={ drink.strDrinkThumb }
                alt={ drink.strDrink }
                className="carousel-img"
              />
              <h5
                data-testid={ `${index}-recomendation-title` }
              >
                {drink.strDrink}
              </h5>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>
    );
  };

  const startRecipe = () => {
    const ingredients = searchIngredients('strIngredient');
    const measures = searchIngredients('strMeasure');
    const list = ingredients.map((item, index) => `${item} - ${measures[index]},`);
    const recipesStorage = JSON.parse(localStorage.getItem('inProgressRecipes')) || {};
    const progressRecipes = { ...recipesStorage,
      meals: { ...recipesStorage.meals, [mealDetails.idMeal]: list,
      },
    };
    localStorage.setItem('inProgressRecipes', JSON.stringify(progressRecipes));
  };

  const startButton = () => {
    const storageProgress = JSON.parse(localStorage.getItem('inProgressRecipes'));
    const inProgressFound = storageProgress !== null ? Object.keys(storageProgress.meals)
      : [];
    const mealInProgress = inProgressFound.includes(id);
    const doneRecipes = JSON.parse(localStorage.getItem('doneRecipes'));
    const done = doneRecipes !== null ? Object.keys(doneRecipes.meals).includes(id)
      : false;
    return (
      <Link to={ `/comidas/${id}/in-progress` }>
        <button
          className={ done ? 'invisible-btn' : 'start-recipe basic-btn' }
          type="button"
          data-testid="start-recipe-btn"
          onClick={ startRecipe }
        >
          {mealInProgress ? 'Continuar Receita' : 'Iniciar Receita'}
        </button>
      </Link>
    );
  };

  return (
    <div>
      { !loading && mealDetails === null && <p>N??o foi poss??vel renderizar</p>}
      {loading && <p>Carregando...</p>}
      {renderMeal()}
      {drinkRecomendation !== null && renderRecomendation()}
      { startButton()}
    </div>
  );
}

FoodDetails.propTypes = {
  match: PropTypes.objectOf(PropTypes.string),
}.isRequired;

export default FoodDetails;
