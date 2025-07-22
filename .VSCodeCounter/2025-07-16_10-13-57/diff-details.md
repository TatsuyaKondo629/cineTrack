# Diff Details

Date : 2025-07-16 10:13:57

Directory /Users/tatsuyakondo/Documents/SALTO/cineTrack

Total : 63 files,  8360 codes, 630 comments, 1516 blanks, all 10506 lines

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [.claude/settings.local.json](/.claude/settings.local.json) | JSON | 12 | 0 | 0 | 12 |
| [README.md](/README.md) | Markdown | 83 | 0 | 21 | 104 |
| [backend/pom.xml](/backend/pom.xml) | XML | 5 | 1 | 0 | 6 |
| [backend/src/main/java/com/cinetrack/config/SecurityConfig.java](/backend/src/main/java/com/cinetrack/config/SecurityConfig.java) | Java | 1 | 0 | 0 | 1 |
| [backend/src/main/java/com/cinetrack/controller/SocialController.java](/backend/src/main/java/com/cinetrack/controller/SocialController.java) | Java | 142 | 27 | 22 | 191 |
| [backend/src/main/java/com/cinetrack/controller/TheaterController.java](/backend/src/main/java/com/cinetrack/controller/TheaterController.java) | Java | 143 | 33 | 17 | 193 |
| [backend/src/main/java/com/cinetrack/controller/UserController.java](/backend/src/main/java/com/cinetrack/controller/UserController.java) | Java | 48 | 6 | 12 | 66 |
| [backend/src/main/java/com/cinetrack/controller/ViewingRecordController.java](/backend/src/main/java/com/cinetrack/controller/ViewingRecordController.java) | Java | 12 | 1 | 2 | 15 |
| [backend/src/main/java/com/cinetrack/dto/ActivityDto.java](/backend/src/main/java/com/cinetrack/dto/ActivityDto.java) | Java | 108 | 2 | 33 | 143 |
| [backend/src/main/java/com/cinetrack/dto/TheaterDto.java](/backend/src/main/java/com/cinetrack/dto/TheaterDto.java) | Java | 140 | 5 | 34 | 179 |
| [backend/src/main/java/com/cinetrack/dto/UserDto.java](/backend/src/main/java/com/cinetrack/dto/UserDto.java) | Java | 118 | 4 | 40 | 162 |
| [backend/src/main/java/com/cinetrack/dto/UserUpdateRequest.java](/backend/src/main/java/com/cinetrack/dto/UserUpdateRequest.java) | Java | 60 | 2 | 24 | 86 |
| [backend/src/main/java/com/cinetrack/dto/ViewingRecordCreateRequest.java](/backend/src/main/java/com/cinetrack/dto/ViewingRecordCreateRequest.java) | Java | 79 | 2 | 30 | 111 |
| [backend/src/main/java/com/cinetrack/dto/ViewingRecordDto.java](/backend/src/main/java/com/cinetrack/dto/ViewingRecordDto.java) | Java | 127 | 3 | 43 | 173 |
| [backend/src/main/java/com/cinetrack/dto/ViewingRecordUpdateRequest.java](/backend/src/main/java/com/cinetrack/dto/ViewingRecordUpdateRequest.java) | Java | 55 | 2 | 21 | 78 |
| [backend/src/main/java/com/cinetrack/entity/Follow.java](/backend/src/main/java/com/cinetrack/entity/Follow.java) | Java | 68 | 3 | 21 | 92 |
| [backend/src/main/java/com/cinetrack/entity/Theater.java](/backend/src/main/java/com/cinetrack/entity/Theater.java) | Java | 155 | 3 | 50 | 208 |
| [backend/src/main/java/com/cinetrack/entity/User.java](/backend/src/main/java/com/cinetrack/entity/User.java) | Java | 26 | 0 | 9 | 35 |
| [backend/src/main/java/com/cinetrack/entity/ViewingRecord.java](/backend/src/main/java/com/cinetrack/entity/ViewingRecord.java) | Java | 11 | 0 | 3 | 14 |
| [backend/src/main/java/com/cinetrack/repository/FollowRepository.java](/backend/src/main/java/com/cinetrack/repository/FollowRepository.java) | Java | 29 | 9 | 12 | 50 |
| [backend/src/main/java/com/cinetrack/repository/TheaterRepository.java](/backend/src/main/java/com/cinetrack/repository/TheaterRepository.java) | Java | 47 | 11 | 14 | 72 |
| [backend/src/main/java/com/cinetrack/repository/UserRepository.java](/backend/src/main/java/com/cinetrack/repository/UserRepository.java) | Java | 5 | 1 | 2 | 8 |
| [backend/src/main/java/com/cinetrack/repository/ViewingRecordRepository.java](/backend/src/main/java/com/cinetrack/repository/ViewingRecordRepository.java) | Java | 1 | 0 | 1 | 2 |
| [backend/src/main/java/com/cinetrack/repository/WishlistRepository.java](/backend/src/main/java/com/cinetrack/repository/WishlistRepository.java) | Java | 1 | 3 | 1 | 5 |
| [backend/src/main/java/com/cinetrack/service/SocialService.java](/backend/src/main/java/com/cinetrack/service/SocialService.java) | Java | 214 | 43 | 55 | 312 |
| [backend/src/main/java/com/cinetrack/service/TheaterService.java](/backend/src/main/java/com/cinetrack/service/TheaterService.java) | Java | 194 | 52 | 35 | 281 |
| [backend/src/main/java/com/cinetrack/service/TmdbService.java](/backend/src/main/java/com/cinetrack/service/TmdbService.java) | Java | 5 | 0 | 1 | 6 |
| [backend/src/main/java/com/cinetrack/service/UserService.java](/backend/src/main/java/com/cinetrack/service/UserService.java) | Java | 36 | 4 | 10 | 50 |
| [backend/src/main/java/com/cinetrack/service/ViewingRecordService.java](/backend/src/main/java/com/cinetrack/service/ViewingRecordService.java) | Java | 98 | 5 | 26 | 129 |
| [backend/src/main/resources/db/migration/V3\_\_add\_theater\_id\_to\_viewing\_records.sql](/backend/src/main/resources/db/migration/V3__add_theater_id_to_viewing_records.sql) | MS SQL | 3 | 2 | 1 | 6 |
| [backend/src/main/resources/db/migration/V4\_\_add\_user\_profile\_fields.sql](/backend/src/main/resources/db/migration/V4__add_user_profile_fields.sql) | MS SQL | 4 | 1 | 0 | 5 |
| [backend/src/test/java/com/cinetrack/config/TestSecurityConfig.java](/backend/src/test/java/com/cinetrack/config/TestSecurityConfig.java) | Java | 14 | 0 | 3 | 17 |
| [backend/src/test/java/com/cinetrack/config/TestUserDetails.java](/backend/src/test/java/com/cinetrack/config/TestUserDetails.java) | Java | 39 | 0 | 11 | 50 |
| [backend/src/test/java/com/cinetrack/config/TestUserDetailsArgumentResolver.java](/backend/src/test/java/com/cinetrack/config/TestUserDetailsArgumentResolver.java) | Java | 20 | 0 | 4 | 24 |
| [backend/src/test/java/com/cinetrack/config/TestUserDetailsConfig.java](/backend/src/test/java/com/cinetrack/config/TestUserDetailsConfig.java) | Java | 18 | 0 | 5 | 23 |
| [backend/src/test/java/com/cinetrack/controller/AuthControllerTest.java](/backend/src/test/java/com/cinetrack/controller/AuthControllerTest.java) | Java | 2 | 0 | 0 | 2 |
| [backend/src/test/java/com/cinetrack/controller/MovieControllerTest.java](/backend/src/test/java/com/cinetrack/controller/MovieControllerTest.java) | Java | 188 | 20 | 40 | 248 |
| [backend/src/test/java/com/cinetrack/controller/SocialControllerTest.java](/backend/src/test/java/com/cinetrack/controller/SocialControllerTest.java) | Java | 321 | 44 | 76 | 441 |
| [backend/src/test/java/com/cinetrack/controller/StatsControllerTest.java](/backend/src/test/java/com/cinetrack/controller/StatsControllerTest.java) | Java | 228 | 24 | 44 | 296 |
| [backend/src/test/java/com/cinetrack/controller/TheaterControllerTest.java](/backend/src/test/java/com/cinetrack/controller/TheaterControllerTest.java) | Java | 340 | 50 | 90 | 480 |
| [backend/src/test/java/com/cinetrack/controller/ViewingRecordControllerTest.java](/backend/src/test/java/com/cinetrack/controller/ViewingRecordControllerTest.java) | Java | 262 | 1 | 48 | 311 |
| [backend/src/test/java/com/cinetrack/controller/WishlistControllerTest.java](/backend/src/test/java/com/cinetrack/controller/WishlistControllerTest.java) | Java | 262 | 24 | 51 | 337 |
| [backend/src/test/java/com/cinetrack/service/SocialServiceTest.java](/backend/src/test/java/com/cinetrack/service/SocialServiceTest.java) | Java | 325 | 44 | 72 | 441 |
| [backend/src/test/java/com/cinetrack/service/StatsServiceTest.java](/backend/src/test/java/com/cinetrack/service/StatsServiceTest.java) | Java | 170 | 31 | 51 | 252 |
| [backend/src/test/java/com/cinetrack/service/TheaterServiceTest.java](/backend/src/test/java/com/cinetrack/service/TheaterServiceTest.java) | Java | 317 | 63 | 79 | 459 |
| [backend/src/test/java/com/cinetrack/service/TmdbServiceTest.java](/backend/src/test/java/com/cinetrack/service/TmdbServiceTest.java) | Java | 186 | 37 | 65 | 288 |
| [backend/src/test/java/com/cinetrack/service/UserServiceTest.java](/backend/src/test/java/com/cinetrack/service/UserServiceTest.java) | Java | 2 | 0 | 0 | 2 |
| [backend/src/test/java/com/cinetrack/service/ViewingRecordServiceTest.java](/backend/src/test/java/com/cinetrack/service/ViewingRecordServiceTest.java) | Java | 2 | 0 | 0 | 2 |
| [backend/src/test/java/com/cinetrack/service/WishlistServiceTest.java](/backend/src/test/java/com/cinetrack/service/WishlistServiceTest.java) | Java | 189 | 34 | 51 | 274 |
| [backend/src/test/resources/application-test.yml](/backend/src/test/resources/application-test.yml) | YAML | 38 | 3 | 8 | 49 |
| [frontend/src/App.js](/frontend/src/App.js) | JavaScript | 56 | 0 | 0 | 56 |
| [frontend/src/components/TheaterSearch.js](/frontend/src/components/TheaterSearch.js) | JavaScript | 446 | 7 | 38 | 491 |
| [frontend/src/components/layout/Navbar.js](/frontend/src/components/layout/Navbar.js) | JavaScript | 75 | 0 | 0 | 75 |
| [frontend/src/pages/ActivityFeed.js](/frontend/src/pages/ActivityFeed.js) | JavaScript | 334 | 1 | 25 | 360 |
| [frontend/src/pages/FollowManagement.js](/frontend/src/pages/FollowManagement.js) | JavaScript | 378 | 3 | 28 | 409 |
| [frontend/src/pages/Movies.js](/frontend/src/pages/Movies.js) | JavaScript | 10 | 0 | 0 | 10 |
| [frontend/src/pages/ProfileEdit.js](/frontend/src/pages/ProfileEdit.js) | JavaScript | 398 | 3 | 38 | 439 |
| [frontend/src/pages/Theaters.js](/frontend/src/pages/Theaters.js) | JavaScript | 403 | 4 | 41 | 448 |
| [frontend/src/pages/UserProfile.js](/frontend/src/pages/UserProfile.js) | JavaScript | 375 | 0 | 34 | 409 |
| [frontend/src/pages/UserSearch.js](/frontend/src/pages/UserSearch.js) | JavaScript | 258 | 1 | 22 | 281 |
| [frontend/src/pages/UserViewingRecords.js](/frontend/src/pages/UserViewingRecords.js) | JavaScript | 263 | 0 | 21 | 284 |
| [frontend/src/pages/Wishlist.js](/frontend/src/pages/Wishlist.js) | JavaScript | 379 | 1 | 18 | 398 |
| [start-dev.sh](/start-dev.sh) | Shell Script | 32 | 10 | 13 | 55 |

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details