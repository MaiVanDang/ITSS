@SpringBootTest
@AutoConfigureMockMvc
public class SystemIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private UserRepository userRepository;
    
    @Test
    public void testUserRegistrationFlow() throws Exception {
        User newUser = new User();
        newUser.setUsername("integrationuser");
        newUser.setEmail("integration@test.com");
        newUser.setPassword("testpass123");
        
        when(userRepository.save(any(User.class))).thenReturn(newUser);
        
        mockMvc.perform(post("/api/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"integrationuser\",\"email\":\"integration@test.com\",\"password\":\"testpass123\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("integrationuser"))
                .andExpect(jsonPath("$.email").value("integration@test.com"));
    }
    
    @Test
    public void testShoppingListCreationFlow() throws Exception {
        User mockUser = new User();
        mockUser.setId(1);
        
        when(userRepository.findById(1)).thenReturn(Optional.of(mockUser));
        
        mockMvc.perform(post("/api/shopping/create")
                .header("Authorization", "Bearer mocktoken")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"userId\":1}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value(1));
    }
}