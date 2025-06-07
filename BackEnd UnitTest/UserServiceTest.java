@SpringBootTest
public class UserServiceTest {
    
    @Autowired
    private UserService userService;
    
    @MockBean
    private UserRepository userRepository;
    
    @Test
    public void testCreateUser() {
        User newUser = new User();
        newUser.setUsername("testuser");
        newUser.setEmail("test@example.com");
        newUser.setPassword("password123");
        
        when(userRepository.save(any(User.class))).thenReturn(newUser);
        
        User createdUser = userService.createUser(newUser);
        
        assertNotNull(createdUser);
        assertEquals("testuser", createdUser.getUsername());
        assertEquals("test@example.com", createdUser.getEmail());
        assertNotEquals("password123", createdUser.getPassword()); // Password should be hashed
    }
    
    @Test
    public void testFindByEmail() {
        User mockUser = new User();
        mockUser.setEmail("existing@example.com");
        
        when(userRepository.findByEmail("existing@example.com")).thenReturn(Optional.of(mockUser));
        
        Optional<User> foundUser = userService.findByEmail("existing@example.com");
        
        assertTrue(foundUser.isPresent());
        assertEquals("existing@example.com", foundUser.get().getEmail());
    }
    
    @Test
    public void testUpdateUserRole() {
        User mockUser = new User();
        mockUser.setId(1);
        mockUser.setRole("user");
        
        when(userRepository.findById(1)).thenReturn(Optional.of(mockUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        
        User updatedUser = userService.updateUserRole(1, "admin");
        
        assertEquals("admin", updatedUser.getRole());
    }
}