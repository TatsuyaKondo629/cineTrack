import React, { useState, useEffect, useCallback } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Autocomplete
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  MyLocation as MyLocationIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import axios from 'axios';

const TheaterSearch = ({ 
  selectedTheater, 
  onTheaterSelect, 
  variant = 'dropdown', // 'dropdown' or 'dialog'
  label = '映画館を選択'
}) => {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrefecture, setSelectedPrefecture] = useState('');
  const [selectedChain, setSelectedChain] = useState('');
  
  // メタデータ
  const [prefectures, setPrefectures] = useState([]);
  const [chains, setChains] = useState([]);
  
  // 位置情報
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  
  // オートコンプリート用のオプション
  const [theaterOptions, setTheaterOptions] = useState([]);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

  // 初期化時にメタデータを取得
  useEffect(() => {
    fetchMetadata();
    fetchAllTheaters(); // 両方のvariantで初期データを読み込み
  }, [variant]);

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

  const fetchAllTheaters = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/theaters`);
      
      if (response.data.success) {
        const theaterData = response.data.data;
        setTheaters(theaterData);
        setTheaterOptions(theaterData.map(theater => ({
          id: theater.id,
          label: theater.displayName || theater.name,
          theater: theater
        })));
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
        const theaterData = response.data.data;
        setTheaters(theaterData);
        setTheaterOptions(theaterData.map(theater => ({
          id: theater.id,
          label: theater.displayName || theater.name,
          theater: theater
        })));
      } else {
        setError('検索に失敗しました');
      }
    } catch (error) {
      console.error('Error searching theaters:', error);
      setError('検索に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, searchQuery, selectedPrefecture, selectedChain, currentLocation]);

  // 検索条件が変更されたときに自動検索（デバウンス付き）
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery || selectedPrefecture || selectedChain || currentLocation) {
        searchTheaters();
      }
    }, 500); // 500ms のデバウンス

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedPrefecture, selectedChain, currentLocation, searchTheaters]);

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
    setSelectedChain('');
    setCurrentLocation(null);
    fetchAllTheaters(); // 両方のvariantで初期データを読み込み
  };

  const handleTheaterSelect = (theater) => {
    onTheaterSelect(theater);
  };

  // ドロップダウン版
  if (variant === 'dropdown') {
    return (
      <Box>
        {/* 代替案：Selectコンポーネントを使用 */}
        <FormControl fullWidth>
          <InputLabel>{label}</InputLabel>
          <Select
            value={selectedTheater ? selectedTheater.id : ''}
            onChange={(event) => {
              const selectedId = event.target.value;
              const selectedOption = theaterOptions.find(option => option.theater.id === selectedId);
              handleTheaterSelect(selectedOption ? selectedOption.theater : null);
            }}
            label={label}
          >
            <MenuItem value="">
              <em>選択してください</em>
            </MenuItem>
            {theaterOptions.map((option) => (
              <MenuItem key={option.id} value={option.theater.id}>
                <Box>
                  <Typography variant="body1">{option.label}</Typography>
                  {option.theater.address && (
                    <Typography variant="body2" color="text.secondary">
                      {option.theater.shortAddress || option.theater.address}
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {/* 検索フィルター */}
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="映画館名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small" sx={{ minWidth: 120 }}>
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
            
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small" sx={{ minWidth: 140 }}>
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
          </Grid>
          
          <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Tooltip title="現在地周辺を検索">
              <IconButton
                onClick={getCurrentLocation}
                disabled={locationLoading}
                size="small"
                color="primary"
              >
                {locationLoading ? <CircularProgress size={16} /> : <MyLocationIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="条件をクリア">
              <IconButton onClick={clearFilters} size="small">
                <ClearIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={searchTheaters} size="small" color="primary">
              <SearchIcon />
            </IconButton>
          </Box>
          
          {currentLocation && (
            <Box sx={{ mt: 1 }}>
              <Chip
                icon={<MyLocationIcon />}
                label="現在地周辺で検索中"
                color="primary"
                variant="outlined"
                size="small"
                onDelete={() => setCurrentLocation(null)}
              />
            </Box>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
    );
  }

  // リスト版（ダイアログ内で使用）
  return (
    <Box>
      {/* 検索フィルター */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12 }}>
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
        
        <Grid size={{ xs: 6 }}>
          <FormControl fullWidth>
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
        
        <Grid size={{ xs: 6 }}>
          <FormControl fullWidth>
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
      </Grid>

      <Box sx={{ display: 'flex', gap: 1, mb: 3, justifyContent: 'flex-end' }}>
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
        <IconButton onClick={searchTheaters} size="small" color="primary">
          <SearchIcon />
        </IconButton>
      </Box>

      {currentLocation && (
        <Box sx={{ mb: 2 }}>
          <Chip
            icon={<MyLocationIcon />}
            label="現在地周辺で検索中"
            color="primary"
            variant="outlined"
            onDelete={() => setCurrentLocation(null)}
          />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* 検索結果 */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={2}>
          <CircularProgress />
        </Box>
      ) : (
        <Card sx={{ maxHeight: 400, overflow: 'auto' }}>
          <List>
            {theaters.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="映画館が見つかりませんでした"
                  secondary="検索条件を変更してください"
                />
              </ListItem>
            ) : (
              theaters.map((theater, index) => (
                <React.Fragment key={theater.id}>
                  <ListItem disablePadding>
                    <ListItemButton 
                      onClick={() => handleTheaterSelect(theater)}
                      selected={selectedTheater && selectedTheater.id === theater.id}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">
                              {theater.displayName || theater.name}
                            </Typography>
                            {theater.chain && (
                              <Chip 
                                label={theater.chain} 
                                size="small" 
                                variant="outlined" 
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            {theater.address && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <LocationIcon sx={{ fontSize: 14, color: 'text.secondary', mr: 0.5 }} />
                                <Typography variant="body2" color="text.secondary">
                                  {theater.address}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < theaters.length - 1 && <Divider />}
                </React.Fragment>
              ))
            )}
          </List>
        </Card>
      )}
    </Box>
  );
};

export default TheaterSearch;