@SpringBootTest
public class ShoppingServiceTest {
    
    @Autowired
    private ShoppingService shoppingService;
    
    @MockBean
    private ShoppingRepository shoppingRepository;
    
    @MockBean
    private IngredientsRepository ingredientsRepository;
    
    @Test
    public void testCreateShoppingList() {
        ShoppingList newList = new ShoppingList();
        newList.setUserId(1);
        
        when(shoppingRepository.save(any(ShoppingList.class))).thenReturn(newList);
        
        ShoppingList createdList = shoppingService.createShoppingList(1);
        
        assertNotNull(createdList);
        assertEquals(1, createdList.getUserId());
        assertNotNull(createdList.getCreateAt());
    }
    
    @Test
    public void testAddItemToShoppingList() {
        ShoppingList mockList = new ShoppingList();
        mockList.setId(1);
        
        Ingredients mockIngredient = new Ingredients();
        mockIngredient.setId(1);
        
        ShoppingAttribute attribute = new ShoppingAttribute();
        attribute.setShoppingId(1);
        attribute.setIngredientsId(1);
        attribute.setQuantity(3);
        
        when(shoppingRepository.findById(1)).thenReturn(Optional.of(mockList));
        when(ingredientsRepository.findById(1)).thenReturn(Optional.of(mockIngredient));
        when(shoppingAttributeRepository.save(any(ShoppingAttribute.class))).thenReturn(attribute);
        
        ShoppingAttribute addedItem = shoppingService.addItemToShoppingList(1, 1, 3);
        
        assertNotNull(addedItem);
        assertEquals(1, addedItem.getShoppingId());
        assertEquals(1, addedItem.getIngredientsId());
        assertEquals(3, addedItem.getQuantity());
    }
    
    @Test
    public void testGenerateShoppingListFromMissingIngredients() {
        // Mock data for ingredients needed for recipes but missing in fridge
        when(ingredientsRepository.findMissingIngredientsForUser(1)).thenReturn(Arrays.asList(1, 2, 3));
        
        Ingredients ingredient1 = new Ingredients();
        ingredient1.setId(1);
        ingredient1.setName("Flour");
        
        Ingredients ingredient2 = new Ingredients();
        ingredient2.setId(2);
        ingredient2.setName("Sugar");
        
        when(ingredientsRepository.findAllById(Arrays.asList(1, 2, 3))).thenReturn(Arrays.asList(ingredient1, ingredient2));
        
        ShoppingList generatedList = shoppingService.generateShoppingListFromMissingIngredients(1);
        
        assertNotNull(generatedList);
        assertEquals(1, generatedList.getUserId());
        // Additional assertions for the generated items
    }
}