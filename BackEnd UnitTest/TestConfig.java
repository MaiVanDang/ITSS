@Configuration
public class TestConfig {
    
    @Bean
    @Primary
    public PasswordEncoder testPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    @Primary
    public JwtTokenProvider testTokenProvider() {
        return new JwtTokenProvider("testSecretKey", 3600000);
    }
}