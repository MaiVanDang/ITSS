@SpringBootTest
public class FoodServiceTest {
    
    @Autowired
    private FoodService foodService;
    
    @MockBean
    private FridgeRepository fridgeRepository;
    
    @MockBean
    private IngredientsRepository ingredientsRepository;
    
    @Test
    public void testAddFoodToFridge() {
        Fridge fridge = new Fridge();
        fridge.setId(1);
        
        Ingredients ingredient = new Ingredients();
        ingredient.setId(1);
        ingredient.setName("Milk");
        
        FridgeIngredients fridgeIngredient = new FridgeIngredients();
        fridgeIngredient.setFridgeId(1);
        fridgeIngredient.setIngredientsId(1);
        fridgeIngredient.setQuantity(2);
        
        when(fridgeRepository.findById(1)).thenReturn(Optional.of(fridge));
        when(ingredientsRepository.findById(1)).thenReturn(Optional.of(ingredient));
        when(fridgeIngredientsRepository.save(any(FridgeIngredients.class))).thenReturn(fridgeIngredient);
        
        FridgeIngredients addedItem = foodService.addFoodToFridge(1, 1, 2);
        
        assertNotNull(addedItem);
        assertEquals(1, addedItem.getFridgeId());
        assertEquals(1, addedItem.getIngredientsId());
        assertEquals(2, addedItem.getQuantity());
    }
    
    @Test
    public void testCheckExpiredFood() {
        FridgeIngredients item1 = new FridgeIngredients();
        item1.setExprided(Date.from(Instant.now().minus(1, ChronoUnit.DAYS)));
        
        FridgeIngredients item2 = new FridgeIngredients();
        item2.setExprided(Date.from(Instant.now().plus(1, ChronoUnit.DAYS)));
        
        when(fridgeIngredientsRepository.findByFridgeId(1)).thenReturn(Arrays.asList(item1, item2));
        
        List<FridgeIngredients> expiredItems = foodService.getExpiredFoodItems(1);
        
        assertEquals(1, expiredItems.size());
        assertTrue(expiredItems.get(0).getExprided().before(new Date()));
    }
}