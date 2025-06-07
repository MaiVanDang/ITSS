@SpringBootTest
public class RecipeServiceTest {
    
    @Autowired
    private RecipeService recipeService;
    
    @MockBean
    private RecipeRepository recipeRepository;
    
    @MockBean
    private DishRepository dishRepository;
    
    @MockBean
    private IngredientsRepository ingredientsRepository;
    
    @Test
    public void testCreateRecipe() {
        Recipe newRecipe = new Recipe();
        newRecipe.setRecipeName("Pasta Carbonara");
        newRecipe.setDescription("Classic Italian pasta dish");
        
        when(recipeRepository.save(any(Recipe.class))).thenReturn(newRecipe);
        
        Recipe createdRecipe = recipeService.createRecipe(newRecipe);
        
        assertNotNull(createdRecipe);
        assertEquals("Pasta Carbonara", createdRecipe.getRecipeName());
        assertEquals("Classic Italian pasta dish", createdRecipe.getDescription());
    }
    
    @Test
    public void testSuggestRecipesBasedOnIngredients() {
        Ingredients ingredient1 = new Ingredients();
        ingredient1.setId(1);
        ingredient1.setName("Pasta");
        
        Ingredients ingredient2 = new Ingredients();
        ingredient2.setId(2);
        ingredient2.setName("Eggs");
        
        // Mock user's fridge ingredients
        when(fridgeIngredientsRepository.findByUserId(1)).thenReturn(Arrays.asList(
            createFridgeIngredient(1, 1, 200), // 200g Pasta
            createFridgeIngredient(1, 2, 4)     // 4 Eggs
        ));
        
        // Mock recipes that can be made with these ingredients
        Recipe recipe1 = new Recipe();
        recipe1.setId(1);
        recipe1.setRecipeName("Spaghetti Carbonara");
        
        when(recipeRepository.findByRequiredIngredients(Arrays.asList(1, 2))).thenReturn(Arrays.asList(recipe1));
        
        List<Recipe> suggestedRecipes = recipeService.suggestRecipes(1);
        
        assertFalse(suggestedRecipes.isEmpty());
        assertEquals("Spaghetti Carbonara", suggestedRecipes.get(0).getRecipeName());
    }
    
    private FridgeIngredients createFridgeIngredient(int userId, int ingredientId, int quantity) {
        FridgeIngredients fi = new FridgeIngredients();
        fi.setUserId(userId);
        fi.setIngredientsId(ingredientId);
        fi.setQuantity(quantity);
        return fi;
    }
}