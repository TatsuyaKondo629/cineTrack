--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13 (Debian 15.13-1.pgdg120+1)
-- Dumped by pg_dump version 15.13 (Debian 15.13-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: theaters; Type: TABLE DATA; Schema: public; Owner: cinetrack_user
--

INSERT INTO public.theaters (id, address, chain, city, created_at, is_active, latitude, location, longitude, name, phone, prefecture, updated_at, website) VALUES (1, '渋谷区道玄坂2-6-17', 'TOHOシネマズ', '渋谷区', '2025-07-28 06:52:22.069928', true, 35.658, NULL, 139.6956, 'TOHOシネマズ渋谷', '050-6868-5002', '東京都', '2025-07-28 06:52:22.069928', 'https://hlo.tohotheater.jp/net/movie/TNPI3060J01.do?sakujo_cd=016');
INSERT INTO public.theaters (id, address, chain, city, created_at, is_active, latitude, location, longitude, name, phone, prefecture, updated_at, website) VALUES (2, '新宿区歌舞伎町1-19-1', 'TOHOシネマズ', '新宿区', '2025-07-28 06:52:22.069928', true, 35.6949, NULL, 139.7007, 'TOHOシネマズ新宿', '050-6868-5011', '東京都', '2025-07-28 06:52:22.069928', 'https://hlo.tohotheater.jp/net/movie/TNPI3060J01.do?sakujo_cd=039');
INSERT INTO public.theaters (id, address, chain, city, created_at, is_active, latitude, location, longitude, name, phone, prefecture, updated_at, website) VALUES (3, '豊島区東池袋1-22-10', 'TOHOシネマズ', '豊島区', '2025-07-28 06:52:22.069928', true, 35.7309, NULL, 139.7187, 'TOHOシネマズ池袋', '050-6868-5013', '東京都', '2025-07-28 06:52:22.069928', 'https://hlo.tohotheater.jp/net/movie/TNPI3060J01.do?sakujo_cd=038');
INSERT INTO public.theaters (id, address, chain, city, created_at, is_active, latitude, location, longitude, name, phone, prefecture, updated_at, website) VALUES (4, '板橋区徳丸2-6-1', 'イオンシネマ', '板橋区', '2025-07-28 06:52:22.069928', true, 35.7789, NULL, 139.6584, 'イオンシネマ板橋', '03-3937-1551', '東京都', '2025-07-28 06:52:22.069928', 'https://www.aeoncinema.com/cinema/itabashi/');
INSERT INTO public.theaters (id, address, chain, city, created_at, is_active, latitude, location, longitude, name, phone, prefecture, updated_at, website) VALUES (5, '江東区豊洲2-4-9', 'ユナイテッド・シネマ', '江東区', '2025-07-28 06:52:22.069928', true, 35.6547, NULL, 139.7965, 'ユナイテッド・シネマ豊洲', '0570-783-789', '東京都', '2025-07-28 06:52:22.069928', 'https://www.unitedcinemas.jp/toyosu/');
INSERT INTO public.theaters (id, address, chain, city, created_at, is_active, latitude, location, longitude, name, phone, prefecture, updated_at, website) VALUES (6, '新宿区新宿3-15-15', '松竹', '新宿区', '2025-07-28 06:52:22.069928', true, 35.6909, NULL, 139.7043, '新宿ピカデリー', '050-6861-3011', '東京都', '2025-07-28 06:52:22.069928', 'https://www.smt-cinema.com/site/shinjuku/');
INSERT INTO public.theaters (id, address, chain, city, created_at, is_active, latitude, location, longitude, name, phone, prefecture, updated_at, website) VALUES (7, '千代田区有楽町2-5-1', '松竹', '千代田区', '2025-07-28 06:52:22.069928', true, 35.6735, NULL, 139.7627, '有楽町マリオン', '03-3591-1511', '東京都', '2025-07-28 06:52:22.069928', 'https://www.smt-cinema.com/site/yurakucho/');
INSERT INTO public.theaters (id, address, chain, city, created_at, is_active, latitude, location, longitude, name, phone, prefecture, updated_at, website) VALUES (8, '世田谷区玉川3-17-1', '109シネマズ', '世田谷区', '2025-07-28 06:52:22.069928', true, 35.6124, NULL, 139.6324, '109シネマズ二子玉川', '0570-077-109', '東京都', '2025-07-28 06:52:22.069928', 'https://109cinemas.net/futakotamagawa/');
INSERT INTO public.theaters (id, address, chain, city, created_at, is_active, latitude, location, longitude, name, phone, prefecture, updated_at, website) VALUES (9, '江東区木場1-5-30', '109シネマズ', '江東区', '2025-07-28 06:52:22.069928', true, 35.671, NULL, 139.8018, '109シネマズ木場', '0570-003-109', '東京都', '2025-07-28 06:52:22.069928', 'https://109cinemas.net/kiba/');
INSERT INTO public.theaters (id, address, chain, city, created_at, is_active, latitude, location, longitude, name, phone, prefecture, updated_at, website) VALUES (10, '港区高輪4-10-30', 'T・ジョイ', '港区', '2025-07-28 06:52:22.069928', true, 35.6284, NULL, 139.7387, 'T・ジョイ PRINCE品川', '03-5421-1113', '東京都', '2025-07-28 06:52:22.069928', 'https://www.t-joy.net/site/shinagawa/');
INSERT INTO public.theaters (id, address, chain, city, created_at, is_active, latitude, location, longitude, name, phone, prefecture, updated_at, website) VALUES (11, '横浜市中区桜木町1-1-7', 'ブルク', '横浜市', '2025-07-28 06:52:22.069928', true, 35.4517, NULL, 139.6309, '横浜ブルク13', '045-222-6222', '神奈川県', '2025-07-28 06:52:22.069928', 'https://www.burg-13.com/');
INSERT INTO public.theaters (id, address, chain, city, created_at, is_active, latitude, location, longitude, name, phone, prefecture, updated_at, website) VALUES (12, '横浜市西区みなとみらい3-5-1', 'イオンシネマ', '横浜市', '2025-07-28 06:52:22.069928', true, 35.4578, NULL, 139.6307, 'イオンシネマみなとみらい', '045-222-2525', '神奈川県', '2025-07-28 06:52:22.069928', 'https://www.aeoncinema.com/cinema/minatomirai/');
INSERT INTO public.theaters (id, address, chain, city, created_at, is_active, latitude, location, longitude, name, phone, prefecture, updated_at, website) VALUES (13, '川崎市川崎区小川町4-1', 'チネチッタ', '川崎市', '2025-07-28 06:52:22.069928', true, 35.5308, NULL, 139.6959, '川崎チネチッタ', '044-223-3190', '神奈川県', '2025-07-28 06:52:22.069928', 'https://cinecitta.co.jp/');
INSERT INTO public.theaters (id, address, chain, city, created_at, is_active, latitude, location, longitude, name, phone, prefecture, updated_at, website) VALUES (14, '大阪市浪速区難波中2-10-70', 'なんばパークスシネマ', '大阪市', '2025-07-28 06:52:22.069928', true, 34.6665, NULL, 135.5044, 'なんばパークスシネマ', '050-6864-7125', '大阪府', '2025-07-28 06:52:22.069928', 'https://www.parkscinema.com/site/namba/');
INSERT INTO public.theaters (id, address, chain, city, created_at, is_active, latitude, location, longitude, name, phone, prefecture, updated_at, website) VALUES (15, '大阪市北区角田町7-10', 'TOHOシネマズ', '大阪市', '2025-07-28 06:52:22.069928', true, 34.7024, NULL, 135.4959, 'TOHOシネマズ梅田', '050-6868-5022', '大阪府', '2025-07-28 06:52:22.069928', 'https://hlo.tohotheater.jp/net/movie/TNPI3060J01.do?sakujo_cd=062');
INSERT INTO public.theaters (id, address, chain, city, created_at, is_active, latitude, location, longitude, name, phone, prefecture, updated_at, website) VALUES (16, '大阪市西区千代崎3-13-1', 'イオンシネマ', '大阪市', '2025-07-28 06:52:22.069928', true, 34.6753, NULL, 135.4713, 'イオンシネマ大阪ドームシティ', '06-6586-0789', '大阪府', '2025-07-28 06:52:22.069928', 'https://www.aeoncinema.com/cinema/osaka-domecity/');
INSERT INTO public.theaters (id, address, chain, city, created_at, is_active, latitude, location, longitude, name, phone, prefecture, updated_at, website) VALUES (17, '尼崎市潮江1-3-1', 'MOVIX', '尼崎市', '2025-07-28 06:52:22.069928', true, 34.7198, NULL, 135.4092, 'MOVIXあまがさき', '050-6865-3717', '兵庫県', '2025-07-28 06:52:22.069928', 'https://www.smt-cinema.com/site/amagasaki/');
INSERT INTO public.theaters (id, address, chain, city, created_at, is_active, latitude, location, longitude, name, phone, prefecture, updated_at, website) VALUES (18, '神戸市中央区御幸通8-1-6', '松竹', '神戸市', '2025-07-28 06:52:22.069928', true, 34.6913, NULL, 135.1955, '神戸国際松竹', '078-230-3580', '兵庫県', '2025-07-28 06:52:22.069928', 'https://www.smt-cinema.com/site/kobe/');
INSERT INTO public.theaters (id, address, chain, city, created_at, is_active, latitude, location, longitude, name, phone, prefecture, updated_at, website) VALUES (19, '京都市南区久世高田町376-1', 'イオンシネマ', '京都市', '2025-07-28 06:52:22.069928', true, 34.9581, NULL, 135.7071, 'イオンシネマ京都桂川', '075-925-0075', '京都府', '2025-07-28 06:52:22.069928', 'https://www.aeoncinema.com/cinema/kyoto-katsuragawa/');
INSERT INTO public.theaters (id, address, chain, city, created_at, is_active, latitude, location, longitude, name, phone, prefecture, updated_at, website) VALUES (20, 'さいたま市大宮区吉敷町4-263-1', 'MOVIX', 'さいたま市', '2025-07-28 06:52:22.069928', true, 35.9069, NULL, 139.6234, 'MOVIXさいたま', '050-6865-4351', '埼玉県', '2025-07-28 06:52:22.069928', 'https://www.smt-cinema.com/site/saitama/');
INSERT INTO public.theaters (id, address, chain, city, created_at, is_active, latitude, location, longitude, name, phone, prefecture, updated_at, website) VALUES (21, 'さいたま市緑区美園5-50-1', 'イオンシネマ', 'さいたま市', '2025-07-28 06:52:22.069928', true, 35.9047, NULL, 139.6756, 'イオンシネマ浦和美園', '048-812-2055', '埼玉県', '2025-07-28 06:52:22.069928', 'https://www.aeoncinema.com/cinema/urawa-misono/');
INSERT INTO public.theaters (id, address, chain, city, created_at, is_active, latitude, location, longitude, name, phone, prefecture, updated_at, website) VALUES (22, '富士見市山室1-1313', 'TOHOシネマズ', '富士見市', '2025-07-28 06:52:22.069928', true, 35.8472, NULL, 139.5534, 'TOHOシネマズららぽーと富士見', '050-6868-5003', '埼玉県', '2025-07-28 06:52:22.069928', 'https://hlo.tohotheater.jp/net/movie/TNPI3060J01.do?sakujo_cd=017');
INSERT INTO public.theaters (id, address, chain, city, created_at, is_active, latitude, location, longitude, name, phone, prefecture, updated_at, website) VALUES (23, '千葉市美浜区豊砂1-1', 'イオンシネマ', '千葉市', '2025-07-28 06:52:22.069928', true, 35.6502, NULL, 140.0374, 'イオンシネマ幕張新都心', '043-213-3500', '千葉県', '2025-07-28 06:52:22.069928', 'https://www.aeoncinema.com/cinema/makuhari-shintoshin/');
INSERT INTO public.theaters (id, address, chain, city, created_at, is_active, latitude, location, longitude, name, phone, prefecture, updated_at, website) VALUES (24, '市川市鬼高1-1-1', 'TOHOシネマズ', '市川市', '2025-07-28 06:52:22.069928', true, 35.7236, NULL, 139.9308, 'TOHOシネマズ市川コルトンプラザ', '050-6868-5006', '千葉県', '2025-07-28 06:52:22.069928', 'https://hlo.tohotheater.jp/net/movie/TNPI3060J01.do?sakujo_cd=020');
INSERT INTO public.theaters (id, address, chain, city, created_at, is_active, latitude, location, longitude, name, phone, prefecture, updated_at, website) VALUES (25, '千葉市中央区川崎町1-34', 'T・ジョイ', '千葉市', '2025-07-28 06:52:22.069928', true, 35.589, NULL, 140.1073, 'T・ジョイ蘇我', '043-209-3377', '千葉県', '2025-07-28 06:52:22.069928', 'https://www.t-joy.net/site/soga/');


--
-- Name: theaters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cinetrack_user
--

SELECT pg_catalog.setval('public.theaters_id_seq', 25, true);


--
-- PostgreSQL database dump complete
--

