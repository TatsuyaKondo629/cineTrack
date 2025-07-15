import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Link,
  Paper,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Language as WebsiteIcon,
  MyLocation as MyLocationIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import axios from 'axios';

const Theaters = () => {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrefecture, setSelectedPrefecture] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedChain, setSelectedChain] = useState('');
  
  // メタデータ
  const [prefectures, setPrefectures] = useState([]);
  const [cities, setCities] = useState([]);
  const [chains, setChains] = useState([]);
  
  // 位置情報
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

  // 初期化時にメタデータを取得
  useEffect(() => {
    fetchMetadata();
    fetchAllTheaters();
  }, []);

  // 都道府県が変更されたときに市区町村を更新
  useEffect(() => {
    if (selectedPrefecture) {
      fetchCities(selectedPrefecture);
    } else {
      setCities([]);
    }
    setSelectedCity('');
  }, [selectedPrefecture]);

  const fetchMetadata = async () => {
    try {
      const [prefecturesRes, chainsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/theaters/prefectures`),
        axios.get(`${API_BASE_URL}/theaters/chains`)
      ]);

      if (prefecturesRes.data.success) {
        setPrefectures(prefecturesRes.data.data);
      }
      if (chainsRes.data.success) {
        setChains(chainsRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching metadata:', error);
    }
  };

  const fetchCities = async (prefecture) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/theaters/cities`, {
        params: { prefecture }
      });
      
      if (response.data.success) {
        setCities(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchAllTheaters = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/theaters`);
      
      if (response.data.success) {
        setTheaters(response.data.data);
      } else {
        setError('映画館データの取得に失敗しました');
      }
    } catch (error) {
      console.error('Error fetching theaters:', error);
      setError('映画館データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const searchTheaters = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {};
      
      if (searchQuery.trim()) {
        params.query = searchQuery.trim();
      }
      if (selectedPrefecture) {
        params.prefecture = selectedPrefecture;
      }
      if (selectedCity) {
        params.city = selectedCity;
      }
      if (selectedChain) {
        params.chain = selectedChain;
      }
      if (currentLocation) {
        params.latitude = currentLocation.latitude;
        params.longitude = currentLocation.longitude;
        params.radius = 10; // 10km範囲
      }
      
      const response = await axios.get(`${API_BASE_URL}/theaters/search`, { params });
      
      if (response.data.success) {
        setTheaters(response.data.data);
      } else {
        setError('検索に失敗しました');
      }
    } catch (error) {
      console.error('Error searching theaters:', error);
      setError('検索に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, searchQuery, selectedPrefecture, selectedCity, selectedChain, currentLocation]);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    
    if (!navigator.geolocation) {
      alert('お使いのブラウザでは位置情報がサポートされていません');
      setLocationLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('位置情報の取得に失敗しました');
        setLocationLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedPrefecture('');
    setSelectedCity('');
    setSelectedChain('');
    setCurrentLocation(null);
    fetchAllTheaters();
  };

  const createDemoData = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/theaters/demo-data`);
      if (response.data.success) {
        fetchAllTheaters();
        alert('デモデータを作成しました');
      }
    } catch (error) {
      console.error('Error creating demo data:', error);
      alert('デモデータの作成に失敗しました');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          映画館・上映情報検索
        </Typography>
        <Typography variant="body1" color="text.secondary">
          お近くの映画館を検索して、上映情報を確認しましょう
        </Typography>
      </Box>

      {/* 検索フィルター */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          検索条件
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          {/* テキスト検索 */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="映画館名、チェーン名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          
          {/* 都道府県選択 */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth sx={{ minWidth: 140 }}>
              <InputLabel>都道府県</InputLabel>
              <Select
                value={selectedPrefecture}
                onChange={(e) => setSelectedPrefecture(e.target.value)}
                label="都道府県"
              >
                <MenuItem value="">すべて</MenuItem>
                {prefectures.map((prefecture) => (
                  <MenuItem key={prefecture} value={prefecture}>
                    {prefecture}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* 市区町村選択 */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth disabled={!selectedPrefecture} sx={{ minWidth: 120 }}>
              <InputLabel>市区町村</InputLabel>
              <Select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                label="市区町村"
              >
                <MenuItem value="">すべて</MenuItem>
                {cities.map((city) => (
                  <MenuItem key={city} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* チェーン選択 */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth sx={{ minWidth: 160 }}>
              <InputLabel>チェーン</InputLabel>
              <Select
                value={selectedChain}
                onChange={(e) => setSelectedChain(e.target.value)}
                label="チェーン"
              >
                <MenuItem value="">すべて</MenuItem>
                {chains.map((chain) => (
                  <MenuItem key={chain} value={chain}>
                    {chain}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* 検索ボタンとアクション */}
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="contained"
                onClick={searchTheaters}
                startIcon={<SearchIcon />}
                fullWidth
              >
                検索
              </Button>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="現在地周辺を検索">
                  <IconButton
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                    size="small"
                    color="primary"
                  >
                    {locationLoading ? <CircularProgress size={20} /> : <MyLocationIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="条件をクリア">
                  <IconButton onClick={clearFilters} size="small">
                    <ClearIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        {/* 現在地表示 */}
        {currentLocation && (
          <Box sx={{ mt: 2 }}>
            <Chip
              icon={<MyLocationIcon />}
              label="現在地周辺で検索中"
              color="primary"
              variant="outlined"
              onDelete={() => setCurrentLocation(null)}
            />
          </Box>
        )}
      </Paper>

      {/* エラー表示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 検索結果 */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              検索結果: {theaters.length}件
            </Typography>
            {theaters.length === 0 && (
              <Button variant="outlined" onClick={createDemoData}>
                デモデータを作成
              </Button>
            )}
          </Box>
          
          {theaters.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                映画館が見つかりませんでした
              </Typography>
              <Typography variant="body2" color="text.secondary">
                検索条件を変更するか、デモデータを作成してお試しください
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {theaters.map((theater) => (
                <Grid item xs={12} md={6} lg={4} key={theater.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {theater.displayName || theater.name}
                      </Typography>
                      
                      {theater.shortAddress && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            {theater.shortAddress}
                          </Typography>
                        </Box>
                      )}
                      
                      {theater.address && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {theater.address}
                        </Typography>
                      )}
                      
                      {theater.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                          <Link href={`tel:${theater.phone}`} color="inherit" underline="hover">
                            <Typography variant="body2">
                              {theater.phone}
                            </Typography>
                          </Link>
                        </Box>
                      )}
                      
                      {theater.website && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <WebsiteIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                          <Link href={theater.website} target="_blank" rel="noopener noreferrer" color="primary" underline="hover">
                            <Typography variant="body2">
                              公式サイト
                            </Typography>
                          </Link>
                        </Box>
                      )}
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {theater.chain && (
                          <Chip label={theater.chain} size="small" variant="outlined" />
                        )}
                        {theater.prefecture && (
                          <Chip label={theater.prefecture} size="small" color="primary" variant="outlined" />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Container>
  );
};

export default Theaters;