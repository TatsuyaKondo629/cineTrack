package com.cinetrack.entity;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class FollowTest {

    @Test
    void testDefaultConstructor() {
        Follow follow = new Follow();
        
        assertNull(follow.getId());
        assertNull(follow.getFollower());
        assertNull(follow.getFollowing());
        assertNull(follow.getCreatedAt());
    }
    
    @Test
    void testParameterizedConstructor() {
        User follower = new User();
        follower.setId(1L);
        follower.setUsername("follower");
        
        User following = new User();
        following.setId(2L);
        following.setUsername("following");
        
        Follow follow = new Follow(follower, following);
        
        assertEquals(follower, follow.getFollower());
        assertEquals(following, follow.getFollowing());
        assertNull(follow.getId());
        assertNull(follow.getCreatedAt());
    }
    
    @Test
    void testGettersAndSetters() {
        Follow follow = new Follow();
        User follower = new User();
        User following = new User();
        LocalDateTime now = LocalDateTime.now();
        
        follow.setId(1L);
        follow.setFollower(follower);
        follow.setFollowing(following);
        follow.setCreatedAt(now);
        
        assertEquals(1L, follow.getId());
        assertEquals(follower, follow.getFollower());
        assertEquals(following, follow.getFollowing());
        assertEquals(now, follow.getCreatedAt());
    }
    
    @Test
    void testOnCreateCallback() {
        Follow follow = new Follow();
        follow.onCreate();
        
        assertNotNull(follow.getCreatedAt());
    }
    
    @Test
    void testEqualsAndHashCode() {
        User user1 = new User();
        user1.setId(1L);
        user1.setUsername("user1");
        
        User user2 = new User();
        user2.setId(2L);
        user2.setUsername("user2");
        
        User user3 = new User();
        user3.setId(3L);
        user3.setUsername("user3");
        
        Follow follow1 = new Follow(user1, user2);
        Follow follow2 = new Follow(user1, user2);
        Follow follow3 = new Follow(user1, user3);
        Follow follow4 = new Follow(user2, user1);
        
        // Same follower and following should be equal
        assertEquals(follow1, follow2);
        assertEquals(follow1.hashCode(), follow2.hashCode());
        
        // Different following should not be equal
        assertNotEquals(follow1, follow3);
        
        // Different follower should not be equal
        assertNotEquals(follow1, follow4);
        
        // Same object should be equal
        assertEquals(follow1, follow1);
        
        // Different class should not be equal
        assertNotEquals(follow1, "not a follow");
    }
    
    @Test
    void testEqualsWithNullUsers() {
        Follow follow1 = new Follow();
        Follow follow2 = new Follow();
        
        // Both null should not be equal
        assertNotEquals(follow1, follow2);
        
        User user1 = new User();
        user1.setId(1L);
        
        follow1.setFollower(user1);
        // One null, one not null should not be equal
        assertNotEquals(follow1, follow2);
        
        follow2.setFollower(user1);
        // Both have follower but no following should not be equal
        assertNotEquals(follow1, follow2);
        
        User user2 = new User();
        user2.setId(2L);
        
        follow1.setFollowing(user2);
        follow2.setFollowing(user2);
        // Both have follower and following should be equal
        assertEquals(follow1, follow2);
    }
    
    @Test
    void testEqualsWithNullIds() {
        User user1 = new User();
        user1.setId(null);
        
        User user2 = new User();
        user2.setId(null);
        
        Follow follow1 = new Follow(user1, user2);
        Follow follow2 = new Follow(user1, user2);
        
        // Users with null IDs should not be equal due to NullPointerException handling
        assertNotEquals(follow1, follow2);
    }
}