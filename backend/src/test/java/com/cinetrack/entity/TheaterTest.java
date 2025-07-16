package com.cinetrack.entity;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class TheaterTest {

    @Test
    void testDefaultConstructor() {
        Theater theater = new Theater();
        
        assertNull(theater.getId());
        assertNull(theater.getName());
        assertNull(theater.getChain());
        assertNull(theater.getLocation());
        assertNull(theater.getAddress());
        assertNull(theater.getPhone());
        assertNull(theater.getWebsite());
        assertNull(theater.getPrefecture());
        assertNull(theater.getCity());
        assertNull(theater.getLatitude());
        assertNull(theater.getLongitude());
        assertTrue(theater.getIsActive());
        assertNull(theater.getCreatedAt());
        assertNull(theater.getUpdatedAt());
    }
    
    @Test
    void testGettersAndSetters() {
        Theater theater = new Theater();
        LocalDateTime now = LocalDateTime.now();
        
        theater.setId(1L);
        theater.setName("Test Theater");
        theater.setChain("Test Chain");
        theater.setLocation("Test Location");
        theater.setAddress("Test Address");
        theater.setPhone("123-456-7890");
        theater.setWebsite("http://test.com");
        theater.setPrefecture("Test Prefecture");
        theater.setCity("Test City");
        theater.setLatitude(35.6762);
        theater.setLongitude(139.6503);
        theater.setIsActive(false);
        theater.setCreatedAt(now);
        theater.setUpdatedAt(now);
        
        assertEquals(1L, theater.getId());
        assertEquals("Test Theater", theater.getName());
        assertEquals("Test Chain", theater.getChain());
        assertEquals("Test Location", theater.getLocation());
        assertEquals("Test Address", theater.getAddress());
        assertEquals("123-456-7890", theater.getPhone());
        assertEquals("http://test.com", theater.getWebsite());
        assertEquals("Test Prefecture", theater.getPrefecture());
        assertEquals("Test City", theater.getCity());
        assertEquals(35.6762, theater.getLatitude());
        assertEquals(139.6503, theater.getLongitude());
        assertFalse(theater.getIsActive());
        assertEquals(now, theater.getCreatedAt());
        assertEquals(now, theater.getUpdatedAt());
    }
    
    @Test
    void testOnCreateCallback() {
        Theater theater = new Theater();
        theater.onCreate();
        
        assertNotNull(theater.getCreatedAt());
        assertNotNull(theater.getUpdatedAt());
        // Check that both timestamps are very close (within 1 second)
        assertTrue(Math.abs(theater.getCreatedAt().getNano() - theater.getUpdatedAt().getNano()) < 1000000);
    }
    
    @Test
    void testOnUpdateCallback() {
        Theater theater = new Theater();
        LocalDateTime originalTime = LocalDateTime.now().minusDays(1);
        theater.setCreatedAt(originalTime);
        theater.setUpdatedAt(originalTime);
        
        theater.onUpdate();
        
        assertEquals(originalTime, theater.getCreatedAt());
        assertTrue(theater.getUpdatedAt().isAfter(originalTime));
    }
    
    @Test
    void testEqualsAndHashCode() {
        Theater theater1 = new Theater();
        theater1.setId(1L);
        theater1.setName("Test Theater");
        
        Theater theater2 = new Theater();
        theater2.setId(1L);
        theater2.setName("Different Name");
        
        Theater theater3 = new Theater();
        theater3.setId(2L);
        theater3.setName("Test Theater");
        
        Theater theater4 = new Theater();
        theater4.setId(null);
        
        Theater theater5 = new Theater();
        theater5.setId(null);
        
        // Same ID should be equal
        assertEquals(theater1, theater2);
        assertEquals(theater1.hashCode(), theater2.hashCode());
        
        // Different ID should not be equal
        assertNotEquals(theater1, theater3);
        assertNotEquals(theater1.hashCode(), theater3.hashCode());
        
        // Same object should be equal
        assertEquals(theater1, theater1);
        
        // Null ID objects should be equal based on the Theater equals implementation
        assertEquals(theater4, theater5);
        
        // Theater with null ID should not be equal to theater with non-null ID
        assertNotEquals(theater1, theater4);
        
        // Different class should not be equal
        assertNotEquals(theater1, "not a theater");
    }
    
    @Test
    void testToString() {
        Theater theater = new Theater();
        theater.setId(1L);
        theater.setName("Test Theater");
        theater.setChain("Test Chain");
        theater.setLocation("Test Location");
        theater.setPrefecture("Test Prefecture");
        theater.setCity("Test City");
        
        String expected = "Theater{id=1, name='Test Theater', chain='Test Chain', location='Test Location', prefecture='Test Prefecture', city='Test City'}";
        assertEquals(expected, theater.toString());
    }
}