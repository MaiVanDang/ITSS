@SpringBootTest
public class GroupServiceTest {
    
    @Autowired
    private GroupService groupService;
    
    @MockBean
    private GroupRepository groupRepository;
    
    @MockBean
    private UserRepository userRepository;
    
    @Test
    public void testCreateGroup() {
        User leader = new User();
        leader.setId(1);
        
        Group newGroup = new Group();
        newGroup.setGroupName("Family Group");
        newGroup.setLeaderId(1);
        
        when(userRepository.findById(1)).thenReturn(Optional.of(leader));
        when(groupRepository.save(any(Group.class))).thenReturn(newGroup);
        
        Group createdGroup = groupService.createGroup(newGroup);
        
        assertNotNull(createdGroup);
        assertEquals("Family Group", createdGroup.getGroupName());
        assertEquals(1, createdGroup.getLeaderId());
    }
    
    @Test
    public void testAddMemberToGroup() {
        Group mockGroup = new Group();
        mockGroup.setId(1);
        
        User mockUser = new User();
        mockUser.setId(2);
        
        when(groupRepository.findById(1)).thenReturn(Optional.of(mockGroup));
        when(userRepository.findById(2)).thenReturn(Optional.of(mockUser));
        
        GroupMember newMember = new GroupMember();
        newMember.setGroupId(1);
        newMember.setUserId(2);
        
        when(groupMemberRepository.save(any(GroupMember.class))).thenReturn(newMember);
        
        GroupMember addedMember = groupService.addMemberToGroup(1, 2);
        
        assertNotNull(addedMember);
        assertEquals(1, addedMember.getGroupId());
        assertEquals(2, addedMember.getUserId());
    }
}