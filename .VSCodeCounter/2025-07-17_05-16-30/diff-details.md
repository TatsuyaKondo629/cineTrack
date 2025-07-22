# Diff Details

Date : 2025-07-17 05:16:30

Directory /Users/tatsuyakondo/Documents/SALTO/cineTrack

Total : 38 files,  3018 codes, 392 comments, 772 blanks, all 4182 lines

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [backend/src/main/java/com/cinetrack/entity/Follow.java](/backend/src/main/java/com/cinetrack/entity/Follow.java) | Java | 3 | 0 | 0 | 3 |
| [backend/src/main/java/com/cinetrack/security/JwtAuthenticationFilter.java](/backend/src/main/java/com/cinetrack/security/JwtAuthenticationFilter.java) | Java | 4 | 0 | 0 | 4 |
| [backend/src/main/java/com/cinetrack/service/StatsService.java](/backend/src/main/java/com/cinetrack/service/StatsService.java) | Java | -2 | 1 | 0 | -1 |
| [backend/src/main/java/com/cinetrack/service/TheaterService.java](/backend/src/main/java/com/cinetrack/service/TheaterService.java) | Java | 1 | 0 | 0 | 1 |
| [backend/src/test/java/com/cinetrack/controller/AuthControllerIntegrationTest.java](/backend/src/test/java/com/cinetrack/controller/AuthControllerIntegrationTest.java) | Java | 14 | 3 | 3 | 20 |
| [backend/src/test/java/com/cinetrack/controller/MovieControllerTest.java](/backend/src/test/java/com/cinetrack/controller/MovieControllerTest.java) | Java | 25 | 3 | 5 | 33 |
| [backend/src/test/java/com/cinetrack/controller/TheaterControllerTest.java](/backend/src/test/java/com/cinetrack/controller/TheaterControllerTest.java) | Java | 24 | 4 | 6 | 34 |
| [backend/src/test/java/com/cinetrack/controller/ViewingRecordControllerTest.java](/backend/src/test/java/com/cinetrack/controller/ViewingRecordControllerTest.java) | Java | 91 | 1 | 13 | 105 |
| [backend/src/test/java/com/cinetrack/dto/ActivityDtoTest.java](/backend/src/test/java/com/cinetrack/dto/ActivityDtoTest.java) | Java | 67 | 0 | 11 | 78 |
| [backend/src/test/java/com/cinetrack/dto/ApiResponseTest.java](/backend/src/test/java/com/cinetrack/dto/ApiResponseTest.java) | Java | 59 | 0 | 18 | 77 |
| [backend/src/test/java/com/cinetrack/dto/AuthResponseTest.java](/backend/src/test/java/com/cinetrack/dto/AuthResponseTest.java) | Java | 33 | 0 | 10 | 43 |
| [backend/src/test/java/com/cinetrack/dto/LoginRequestTest.java](/backend/src/test/java/com/cinetrack/dto/LoginRequestTest.java) | Java | 25 | 0 | 10 | 35 |
| [backend/src/test/java/com/cinetrack/dto/RegisterRequestTest.java](/backend/src/test/java/com/cinetrack/dto/RegisterRequestTest.java) | Java | 29 | 0 | 10 | 39 |
| [backend/src/test/java/com/cinetrack/dto/StatsDtoTest.java](/backend/src/test/java/com/cinetrack/dto/StatsDtoTest.java) | Java | 101 | 0 | 20 | 121 |
| [backend/src/test/java/com/cinetrack/dto/TheaterDtoTest.java](/backend/src/test/java/com/cinetrack/dto/TheaterDtoTest.java) | Java | 106 | 7 | 20 | 133 |
| [backend/src/test/java/com/cinetrack/dto/UserDtoTest.java](/backend/src/test/java/com/cinetrack/dto/UserDtoTest.java) | Java | 67 | 0 | 11 | 78 |
| [backend/src/test/java/com/cinetrack/dto/UserUpdateRequestTest.java](/backend/src/test/java/com/cinetrack/dto/UserUpdateRequestTest.java) | Java | 34 | 0 | 8 | 42 |
| [backend/src/test/java/com/cinetrack/dto/ViewingRecordCreateRequestTest.java](/backend/src/test/java/com/cinetrack/dto/ViewingRecordCreateRequestTest.java) | Java | 42 | 0 | 9 | 51 |
| [backend/src/test/java/com/cinetrack/dto/ViewingRecordDtoTest.java](/backend/src/test/java/com/cinetrack/dto/ViewingRecordDtoTest.java) | Java | 75 | 0 | 11 | 86 |
| [backend/src/test/java/com/cinetrack/dto/ViewingRecordUpdateRequestTest.java](/backend/src/test/java/com/cinetrack/dto/ViewingRecordUpdateRequestTest.java) | Java | 33 | 0 | 9 | 42 |
| [backend/src/test/java/com/cinetrack/dto/WishlistDtoTest.java](/backend/src/test/java/com/cinetrack/dto/WishlistDtoTest.java) | Java | 53 | 0 | 11 | 64 |
| [backend/src/test/java/com/cinetrack/dto/tmdb/TmdbGenreDtoTest.java](/backend/src/test/java/com/cinetrack/dto/tmdb/TmdbGenreDtoTest.java) | Java | 25 | 0 | 10 | 35 |
| [backend/src/test/java/com/cinetrack/dto/tmdb/TmdbMovieDtoTest.java](/backend/src/test/java/com/cinetrack/dto/tmdb/TmdbMovieDtoTest.java) | Java | 65 | 0 | 10 | 75 |
| [backend/src/test/java/com/cinetrack/dto/tmdb/TmdbMovieListResponseTest.java](/backend/src/test/java/com/cinetrack/dto/tmdb/TmdbMovieListResponseTest.java) | Java | 30 | 0 | 10 | 40 |
| [backend/src/test/java/com/cinetrack/dto/tmdb/TmdbProductionCompanyDtoTest.java](/backend/src/test/java/com/cinetrack/dto/tmdb/TmdbProductionCompanyDtoTest.java) | Java | 25 | 0 | 8 | 33 |
| [backend/src/test/java/com/cinetrack/entity/FollowTest.java](/backend/src/test/java/com/cinetrack/entity/FollowTest.java) | Java | 98 | 10 | 35 | 143 |
| [backend/src/test/java/com/cinetrack/entity/TheaterTest.java](/backend/src/test/java/com/cinetrack/entity/TheaterTest.java) | Java | 111 | 7 | 27 | 145 |
| [backend/src/test/java/com/cinetrack/entity/UserTest.java](/backend/src/test/java/com/cinetrack/entity/UserTest.java) | Java | 85 | 2 | 20 | 107 |
| [backend/src/test/java/com/cinetrack/entity/ViewingRecordTest.java](/backend/src/test/java/com/cinetrack/entity/ViewingRecordTest.java) | Java | 90 | 1 | 18 | 109 |
| [backend/src/test/java/com/cinetrack/entity/WishlistTest.java](/backend/src/test/java/com/cinetrack/entity/WishlistTest.java) | Java | 85 | 1 | 18 | 104 |
| [backend/src/test/java/com/cinetrack/security/JwtAuthenticationFilterTest.java](/backend/src/test/java/com/cinetrack/security/JwtAuthenticationFilterTest.java) | Java | 195 | 38 | 67 | 300 |
| [backend/src/test/java/com/cinetrack/security/JwtUtilTest.java](/backend/src/test/java/com/cinetrack/security/JwtUtilTest.java) | Java | 177 | 51 | 59 | 287 |
| [backend/src/test/java/com/cinetrack/service/SocialServiceTest.java](/backend/src/test/java/com/cinetrack/service/SocialServiceTest.java) | Java | 126 | 28 | 28 | 182 |
| [backend/src/test/java/com/cinetrack/service/StatsServiceTest.java](/backend/src/test/java/com/cinetrack/service/StatsServiceTest.java) | Java | 0 | 0 | 1 | 1 |
| [backend/src/test/java/com/cinetrack/service/TheaterServiceTest.java](/backend/src/test/java/com/cinetrack/service/TheaterServiceTest.java) | Java | 136 | 37 | 35 | 208 |
| [backend/src/test/java/com/cinetrack/service/TmdbServiceTest.java](/backend/src/test/java/com/cinetrack/service/TmdbServiceTest.java) | Java | 235 | 58 | 81 | 374 |
| [backend/src/test/java/com/cinetrack/service/UserServiceTest.java](/backend/src/test/java/com/cinetrack/service/UserServiceTest.java) | Java | 219 | 43 | 54 | 316 |
| [backend/src/test/java/com/cinetrack/service/ViewingRecordServiceTest.java](/backend/src/test/java/com/cinetrack/service/ViewingRecordServiceTest.java) | Java | 432 | 97 | 106 | 635 |

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details