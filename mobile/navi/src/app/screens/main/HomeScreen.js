import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  View,
  TextInput,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Text,
  StatusBar,
  Platform,
  LayoutAnimation,
  UIManager,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview'; 
import { useLogin } from "../../../providers/loginProvider"; 

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const getTodayDate = () => {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0'); 
  const yyyy = now.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const parkingData = [
  {
    id: "1",
    name: "Estacionamento Central Park",
    rating: 4.7,
    distance: "300m",
    price: "R$ 6/h",
    tags: ["Coberto", "Segurança 24h"],
    availableSpots: 12,
    coords: [-23.561684, -46.655981],
    imageUrl: "https://images.unsplash.com/photo-1565043666747-69f6646db940?q=80&w=1074&auto=format&fit=crop",
  },
  {
    id: "2",
    name: "Garagem Augusta",
    rating: 3.8,
    distance: "500m",
    price: "R$ 4/h",
    tags: ["Aberto", "Barato"],
    availableSpots: 5,
    coords: [-23.562684, -46.654981],
    imageUrl: "https://images.unsplash.com/photo-1470224114660-3f6686c562eb?q=80&w=1035&auto=format&fit=crop",
  },
  {
    id: "3",
    name: "Vagas Premium Leste",
    rating: 4.2,
    distance: "850m",
    price: "R$ 10/h",
    tags: ["VIP", "Recarga Elétrica", "Coberto"],
    availableSpots: 2,
    coords: [-23.563684, -46.652981],
    imageUrl: "https://images.unsplash.com/photo-1630165356623-266076eaceb6?q=80&w=1170&auto=format&fit=crop",
  },
  {
    id: "4",
    name: "Shopping Park Sul",
    rating: 4.9,
    distance: "1.2km",
    price: "R$ 15/h",
    tags: ["Coberto", "Auto-serviço", "Segurança 24h"],
    availableSpots: 35,
    coords: [-23.559684, -46.658981],
    imageUrl: "https://images.unsplash.com/photo-1617886322207-6f504e7472c5?q=80&w=1170&auto=format&fit=crop",
  },
  {
    id: "5",
    name: "Estapar Paulista",
    rating: 4.5,
    distance: "150m",
    price: "R$ 12/h",
    tags: ["Segurança 24h", "VIP"],
    availableSpots: 8,
    coords: [-23.560684, -46.656981],
    imageUrl: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?q=80&w=1167&auto=format&fit=crop",
  },
  {
    id: "6",
    name: "Econômico Center",
    rating: 4.0,
    distance: "2.1km",
    price: "R$ 3/h",
    tags: ["Aberto", "Barato"],
    availableSpots: 50,
    coords: [-23.565684, -46.650981],
    imageUrl: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?q=80&w=1074&auto=format&fit=crop",
  },
];

const quickActions = [
  { title: "Coberto", icon: "shield-outline", filter: "coberto" },
  { title: "Mais Barato", icon: "pricetag-outline", filter: "maisBarato" },
  { title: "Mais Próximo", icon: "navigate-outline", filter: "maisProximo" },
  { title: "Segurança 24h", icon: "lock-closed-outline", filter: "seguranca" },
];

const generateLeafletHtml = (initialParkings) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { margin: 0; padding: 0; height: 100vh; background-color: #f8f8f8; }
    #map { height: 100%; width: 100%; }
    .leaflet-bar { display: none; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const userLat = -23.561284;
    const userLng = -46.656581;
    
    const map = L.map('map', { zoomControl: false }).setView([userLat, userLng], 15);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    const userIcon = L.divIcon({
      className: 'user-marker',
      html: '<div style="background-color: #2563EB; width: 20px; height: 20px; border-radius: 50%; border: 4px solid white; box-shadow: 0 0 0 3px #2563EB;"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    L.marker([userLat, userLng], { icon: userIcon }).addTo(map).bindPopup("Você está aqui");

    const parkingIcon = L.divIcon({
      className: 'parking-marker',
      html: '<div style="background-color: #F5B301; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3); font-weight: bold; color: white; font-size: 16px;">P</div>',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    let currentRouteLine = null;
    let markers = []; 

    function addMarkers(data) {
        markers.forEach(m => map.removeLayer(m));
        markers = [];

        data.forEach(p => {
            if(p.coords) {
                // Cria o marcador SEM POPUP para que o clique vá direto para o app
                const marker = L.marker(p.coords, { icon: parkingIcon }).addTo(map);
                markers.push(marker);
                
                marker.on('click', () => {
                  if (currentRouteLine) {
                    map.removeLayer(currentRouteLine);
                  }
                  currentRouteLine = L.polyline([
                    [userLat, userLng],
                    p.coords
                  ], {
                    color: '#2563EB',
                    weight: 4,
                    opacity: 0.6,
                    dashArray: '10, 10',
                    lineCap: 'round'
                  }).addTo(map);

                  map.fitBounds(currentRouteLine.getBounds(), { padding: [50, 50] });

                  if(window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'markerClick',
                        parking: p
                    }));
                  }
                });
            }
        });
    }

    addMarkers(${JSON.stringify(initialParkings)});

    window.updateMarkers = (newData) => {
        addMarkers(newData);
    };

    window.startNavigationMode = (destLat, destLng) => {
        if(currentRouteLine) {
            currentRouteLine.setStyle({ dashArray: null, opacity: 1, weight: 8, color: '#4285F4' });
        } else {
             currentRouteLine = L.polyline([
                [userLat, userLng],
                [destLat, destLng]
              ], {
                color: '#4285F4',
                weight: 8,
                opacity: 1,
                lineCap: 'round'
              }).addTo(map);
        }
        map.flyTo([userLat, userLng], 18, {
            animate: true,
            duration: 1.5
        });
    }

    window.resetMap = () => {
        if(currentRouteLine) {
            map.removeLayer(currentRouteLine);
            currentRouteLine = null;
        }
        map.flyTo([userLat, userLng], 15, { animate: true, duration: 1 });
    }
    
    window.recenterMap = () => {
        map.flyTo([userLat, userLng], 15, { animate: true, duration: 1 });
    }

  </script>
</body>
</html>
`;


const QuickAction = ({ icon, title, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.quickActionButton, selected && styles.quickActionButtonSelected]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View
      style={[
        styles.quickActionIconContainer,
        selected && styles.quickActionIconSelected,
      ]}
    >
      <Ionicons name={icon} size={26} color={selected ? "#fff" : "#1F2937"} />
    </View>
    <Text
      style={[styles.quickActionText, selected && styles.quickActionTextSelected]}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

const ParkingCard = ({ parking, onPress, onReserve }) => (
  <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
    <View style={styles.card}>
      <Image source={{ uri: parking.imageUrl }} style={styles.cardImage} />

      <View style={styles.cardContent}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>{parking.name}</Text>
        </View>

        <View style={styles.ratingDistanceRow}>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={14} color="#fff" />
            <Text style={styles.ratingText}>{parking.rating.toFixed(1)}</Text>
          </View>

          <Text style={styles.dotSeparator}>•</Text>
          <Ionicons
            name="navigate-circle-outline"
            size={16}
            color="#6B7280"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.distanceText}>{parking.distance}</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.newPriceLabel}>Preço/h:</Text>
            <Text style={styles.newPriceText}>{parking.price}</Text>
          </View>
        </View>

        <View style={styles.tagsContainer}>
          {parking.tags.map((tag, index) => (
            <Text key={index} style={styles.tag}>
              {tag}
            </Text>
          ))}
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.spotsText}>
            <Text style={styles.spotsCount}>{parking.availableSpots}</Text> vagas
            disponíveis
          </Text>

          <TouchableOpacity style={styles.reserveButton} onPress={onReserve}>
            <Text style={styles.reserveButtonText}>Reservar</Text>
            <Ionicons
              name="calendar-outline"
              size={16}
              color="#fff"
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const RouteConfirmationModal = ({ visible, parking, onCancel, onConfirm }) => {
  if (!parking) return null;
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalIconContainer}>
                <Ionicons name="navigate" size={32} color="#F5B301" />
            </View>
            <Text style={styles.modalTitle}>Iniciar Rota?</Text>
            <Text style={styles.modalSubtitle}>
              Deseja ir para <Text style={{fontWeight: 'bold', color: '#333'}}>{parking.name}</Text>?
            </Text>
          </View>
          
          <View style={styles.modalInfoRow}>
             <View style={styles.modalInfoItem}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.modalInfoText}>~15 min</Text>
             </View>
             <View style={styles.modalInfoItem}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.modalInfoText}>{parking.distance}</Text>
             </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalButtonCancel} onPress={onCancel}>
              <Text style={styles.modalButtonCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonConfirm} onPress={onConfirm}>
              <Text style={styles.modalButtonConfirmText}>Iniciar Navegação</Text>
              <Ionicons name="arrow-forward" size={13} color="#fff" style={{marginLeft: 5}}/>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const CalendarPickerModal = ({ visible, onClose, onSelect }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    const changeMonth = (direction) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1);
        setCurrentDate(newDate);
    };

    const handleDayPress = (day) => {
        const dd = String(day).padStart(2, '0');
        const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
        const yyyy = currentDate.getFullYear();
        onSelect(`${dd}/${mm}/${yyyy}`);
        onClose();
    };

    const renderCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        
        const slots = [];
        
        for (let i = 0; i < firstDay; i++) {
            slots.push({ key: `empty-${i}`, day: null });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            slots.push({ key: `day-${i}`, day: i });
        }

        return (
            <FlatList 
                data={slots}
                numColumns={7}
                keyExtractor={item => item.key}
                contentContainerStyle={{paddingVertical: 10}}
                columnWrapperStyle={{justifyContent: 'flex-start'}}
                renderItem={({item}) => {
                    if (!item.day) {
                        return <View style={styles.calendarDayItemEmpty} />;
                    }
                    return (
                        <TouchableOpacity 
                            style={styles.calendarDayItem}
                            onPress={() => handleDayPress(item.day)}
                        >
                            <Text style={styles.calendarDayText}>{item.day}</Text>
                        </TouchableOpacity>
                    );
                }}
            />
        );
    };
    
    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.calendarHeader}>
                        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.calendarArrow}>
                            <Ionicons name="chevron-back" size={24} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.calendarTitle}>
                            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </Text>
                        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.calendarArrow}>
                            <Ionicons name="chevron-forward" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.weekDaysContainer}>
                        {weekDays.map((d, index) => (
                            <Text key={index} style={styles.weekDayText}>{d}</Text>
                        ))}
                    </View>

                    <View style={{height: 300, width: '100%'}}>
                        {renderCalendarDays()}
                    </View>
                    
                    <TouchableOpacity style={[styles.modalButtonCancel, {marginTop: 10, width: '100%'}]} onPress={onClose}>
                        <Text style={styles.modalButtonCancelText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const TimePickerModal = ({ visible, onClose, onSelect, title }) => {
    const hours = Array.from({length: 24}, (_, i) => String(i).padStart(2, '0'));
    const minutes = ['00', '15', '30', '45']; 
    
    const [selectedHour, setSelectedHour] = useState('14');
    const [selectedMinute, setSelectedMinute] = useState('00');

    return (
        <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
             <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <View style={{flexDirection: 'row', justifyContent: 'center', marginVertical: 30, height: 150}}>
                        <ScrollView style={{width: 60}} showsVerticalScrollIndicator={false}>
                            {hours.map(h => (
                                <TouchableOpacity key={h} onPress={() => setSelectedHour(h)} style={{padding: 10, backgroundColor: selectedHour === h ? '#E0F2FE' : 'transparent', borderRadius: 8}}>
                                    <Text style={{fontSize: 20, fontWeight: selectedHour === h ? 'bold' : 'normal', textAlign: 'center', color: selectedHour === h ? '#0EA5E9' : '#333'}}>{h}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <Text style={{fontSize: 24, alignSelf: 'center', marginHorizontal: 10, fontWeight: 'bold'}}>:</Text>
                        <ScrollView style={{width: 60}} showsVerticalScrollIndicator={false}>
                            {minutes.map(m => (
                                <TouchableOpacity key={m} onPress={() => setSelectedMinute(m)} style={{padding: 10, backgroundColor: selectedMinute === m ? '#E0F2FE' : 'transparent', borderRadius: 8}}>
                                    <Text style={{fontSize: 20, fontWeight: selectedMinute === m ? 'bold' : 'normal', textAlign: 'center', color: selectedMinute === m ? '#0EA5E9' : '#333'}}>{m}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                    <TouchableOpacity 
                        style={[styles.modalButtonConfirm, {backgroundColor: '#0EA5E9', width: '100%'}]} 
                        onPress={() => {
                            onSelect(`${selectedHour}:${selectedMinute}`);
                            onClose();
                        }}
                    >
                        <Text style={[styles.modalButtonConfirmText, {color: '#fff'}]}>Confirmar Horário</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

const ReservationModal = ({ visible, parking, onCancel, onConfirm }) => {
    const [date, setDate] = useState(getTodayDate());
    const [startTime, setStartTime] = useState("14:00");
    const [endTime, setEndTime] = useState("16:00");

    const [showCalendar, setShowCalendar] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [timePickerTarget, setTimePickerTarget] = useState('start'); 

    const openTimePicker = (target) => {
        setTimePickerTarget(target);
        setShowTimePicker(true);
    };

    const handleTimeSelect = (time) => {
        if (timePickerTarget === 'start') {
            setStartTime(time);
        } else {
            setEndTime(time);
        }
    };

    if (!parking) return null;
    return (
      <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onCancel}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconContainer, { backgroundColor: '#E0F2FE' }]}>
                  <Ionicons name="calendar" size={32} color="#0EA5E9" />
              </View>
              <Text style={styles.modalTitle}>Reservar Vaga</Text>
              <Text style={styles.modalSubtitle}>
                {parking.name}
              </Text>
            </View>
            
            <View style={{width: '100%', marginBottom: 20}}>
                <Text style={styles.inputLabel}>Data da Reserva</Text>
                
                <TouchableOpacity style={styles.inputTouchable} onPress={() => setShowCalendar(true)}>
                    <Text style={styles.inputText}>{date}</Text>
                    <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                </TouchableOpacity>

                <Text style={styles.inputLabel}>Horário</Text>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    
                    <View style={styles.timeBox}>
                        <Text style={styles.timeLabel}>Entrada</Text>
                        <TouchableOpacity style={styles.timeTouchable} onPress={() => openTimePicker('start')}>
                            <Text style={styles.timeValue}>{startTime}</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <Ionicons name="arrow-forward" size={20} color="#ccc" />
                    
                    <View style={styles.timeBox}>
                        <Text style={styles.timeLabel}>Saída</Text>
                        <TouchableOpacity style={styles.timeTouchable} onPress={() => openTimePicker('end')}>
                            <Text style={styles.timeValue}>{endTime}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
  
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButtonCancel} onPress={onCancel}>
                <Text style={styles.modalButtonCancelText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButtonConfirm, {backgroundColor: '#0EA5E9'}]} 
                onPress={() => onConfirm({date, startTime, endTime})}
              >
                <Text style={[styles.modalButtonConfirmText, {color: '#fff'}]}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <CalendarPickerModal 
            visible={showCalendar} 
            onClose={() => setShowCalendar(false)}
            onSelect={setDate}
        />
        <TimePickerModal 
            visible={showTimePicker} 
            onClose={() => setShowTimePicker(false)}
            onSelect={handleTimeSelect}
            title={timePickerTarget === 'start' ? "Horário de Entrada" : "Horário de Saída"}
        />

      </Modal>
    );
};

const SuccessModal = ({ visible, onClose }) => {
    useEffect(() => {
        if (visible) {
            const timer = setTimeout(onClose, 2500); 
            return () => clearTimeout(timer);
        }
    }, [visible, onClose]);

    return (
        <Modal animationType="fade" transparent={true} visible={visible}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
                <TouchableWithoutFeedback>
                    <View style={[styles.modalContainer, {paddingVertical: 40}]}>
                        <View style={[styles.modalIconContainer, { backgroundColor: '#DCFCE7' }]}>
                            <Ionicons name="checkmark" size={40} color="#22C55E" />
                        </View>
                        <Text style={styles.modalTitle}>Reserva Confirmada!</Text>
                        <Text style={[styles.modalSubtitle, {marginBottom: 20}]}>Sua vaga está garantida.</Text>
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    );
};

const ActiveReservationCard = ({ reservation, onPress }) => (
    <TouchableOpacity style={styles.activeResCard} onPress={onPress} activeOpacity={0.9}>
        <View style={styles.activeResHeader}>
            <Text style={styles.activeResTitle}>Reserva Ativa</Text>
            <View style={styles.activeResBadge}>
                <Text style={styles.activeResBadgeText}>{reservation.date}</Text>
            </View>
        </View>
        <Text style={styles.activeResName}>{reservation.parkingName}</Text>
        <View style={styles.activeResTimeRow}>
            <Ionicons name="time" size={16} color="#0EA5E9" />
            <Text style={styles.activeResTimeText}>{reservation.startTime} - {reservation.endTime}</Text>
        </View>
    </TouchableOpacity>
);

const ActiveReservationDetailsModal = ({ visible, reservation, onClose }) => {
    if (!reservation) return null;
    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
                <TouchableWithoutFeedback>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <View style={[styles.modalIconContainer, { backgroundColor: '#E0F2FE' }]}>
                                <Ionicons name="ticket" size={32} color="#0EA5E9" />
                            </View>
                            <Text style={styles.modalTitle}>Detalhes da Reserva</Text>
                            <Text style={styles.modalSubtitle}>Código: #A384F</Text>
                        </View>

                        <View style={{width: '100%', marginBottom: 24}}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Estacionamento</Text>
                                <Text style={styles.detailValue}>{reservation.parkingName}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Data</Text>
                                <Text style={styles.detailValue}>{reservation.date}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Horário</Text>
                                <Text style={styles.detailValue}>{reservation.startTime} - {reservation.endTime}</Text>
                            </View>
                            <View style={[styles.detailRow, {borderBottomWidth: 0}]}>
                                <Text style={styles.detailLabel}>Status</Text>
                                <View style={{backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6}}>
                                    <Text style={{color: '#22C55E', fontWeight: 'bold', fontSize: 12}}>CONFIRMADO</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    );
};

export default function HomeScreen() {
  const { user } = useLogin();
  const userName = user?.nome || "Usuário";
  const webViewRef = useRef(null);
  const scrollViewRef = useRef(null);

  const [searchText, setSearchText] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [viewMode, setViewMode] = useState('list'); 
  const [activeRouteParking, setActiveRouteParking] = useState(null);
  const [activeReservation, setActiveReservation] = useState(null);

  const [routeModalVisible, setRouteModalVisible] = useState(false);
  const [reservationModalVisible, setReservationModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [activeDetailsVisible, setActiveDetailsVisible] = useState(false);
  const [selectedParking, setSelectedParking] = useState(null);

  useEffect(() => {
    if ((viewMode === 'expanded' || viewMode === 'navigation') && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  }, [viewMode]);

  const filteredData = useMemo(() => {
    let data = [...parkingData];

    if (searchText) {
        const lower = searchText.toLowerCase();
        data = data.filter(p => 
            p.name.toLowerCase().includes(lower) || 
            p.tags.some(t => t.toLowerCase().includes(lower))
        );
    }

    if (selectedFilters.includes('coberto')) {
        data = data.filter(p => p.tags.includes('Coberto'));
    }
    if (selectedFilters.includes('seguranca')) {
        data = data.filter(p => p.tags.includes('Segurança 24h'));
    }

    if (selectedFilters.includes('maisBarato')) {
        data = data.filter(p => {
            const priceVal = parseFloat(p.price.replace(/[^0-9.]/g, ''));
            return priceVal < 10 || p.tags.includes('Barato');
        });

        data.sort((a, b) => {
            const pA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
            const pB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
            return pA - pB;
        });
    }
    
    if (selectedFilters.includes('maisProximo')) {
        const getDistInMeters = (d) => {
            if (d.includes('km')) return parseFloat(d.replace('km', '')) * 1000;
            return parseFloat(d.replace('m', ''));
        };

        data = data.filter(p => getDistInMeters(p.distance) < 1000);

        data.sort((a, b) => {
            return getDistInMeters(a.distance) - getDistInMeters(b.distance);
        });
    }

    return data;
  }, [searchText, selectedFilters]);

  useEffect(() => {
    if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
            if(window.updateMarkers) window.updateMarkers(${JSON.stringify(filteredData)});
            true;
        `);
    }
  }, [filteredData]);

  const mapHtml = useMemo(() => generateLeafletHtml(parkingData), []); 

  const toggleFilter = (filter) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter((f) => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  const toggleMapExpansion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setViewMode(viewMode === 'expanded' ? 'list' : 'expanded');
  };

  const handleRecenter = () => {
      if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            if(window.recenterMap) window.recenterMap();
            true;
          `);
      }
  };

  const exitNavigation = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setViewMode('list');
      setActiveRouteParking(null);
      if(webViewRef.current) {
          webViewRef.current.injectJavaScript(`if(window.resetMap) window.resetMap(); true;`);
      }
  };

  const handleWebViewMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'markerClick') {
        setSelectedParking(data.parking);
        setRouteModalVisible(true);
    }
  };

  const handleCardPress = (parking) => {
      setSelectedParking(parking);
      setRouteModalVisible(true);
  }

  const handleReservePress = (parking) => {
      setSelectedParking(parking);
      setReservationModalVisible(true);
  }

  const confirmReservation = (details) => {
      setReservationModalVisible(false);
      setTimeout(() => {
          setActiveReservation({
              parkingName: selectedParking.name,
              date: details.date,
              startTime: details.startTime,
              endTime: details.endTime
          });
          setSuccessModalVisible(true);
      }, 500);
  }

  const confirmNavigation = () => {
      setRouteModalVisible(false);
      const parking = selectedParking;
      if(!parking) return;

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setViewMode('navigation');
      setActiveRouteParking(parking);

      if(webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            if(window.startNavigationMode) window.startNavigationMode(${parking.coords[0]}, ${parking.coords[1]});
            true;
          `);
      }
  };

  const isFullScreenMode = viewMode === 'expanded' || viewMode === 'navigation';
  const expandedHeight = Dimensions.get('window').height * 0.55; 

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={styles.headerBackground} />

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={[
            styles.scrollContent, 
            isFullScreenMode && { 
                height: Dimensions.get('window').height,
                justifyContent: 'center',
                paddingTop: 0
            } 
        ]} 
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isFullScreenMode} 
      >
        
        {!isFullScreenMode && (
            <View style={styles.topContentOverlay}>
                <View style={styles.header}>
                    <View>
                    <Text style={styles.greetingTitle}>Olá, {userName}</Text>
                    <Text style={styles.greetingSubtitle}>Pronto para estacionar?</Text>
                    </View>
                </View>

                {activeReservation && (
                    <View style={{paddingHorizontal: PADDING, marginBottom: 20}}>
                        <ActiveReservationCard 
                            reservation={activeReservation} 
                            onPress={() => setActiveDetailsVisible(true)}
                        />
                    </View>
                )}

                <View style={styles.searchSection}>
                    <View style={styles.searchBarContainer}>
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                        style={styles.searchBarInput}
                        placeholder="Pesquisar por nome ou tag..."
                        placeholderTextColor="#9CA3AF"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                    </View>

                    <TouchableOpacity style={styles.locationButton} onPress={handleRecenter}>
                    <Ionicons name="locate-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.quickActionsContainer}>
                    {quickActions.map((action, index) => (
                    <QuickAction
                        key={index}
                        icon={action.icon}
                        title={action.title}
                        selected={selectedFilters.includes(action.filter)}
                        onPress={() => toggleFilter(action.filter)}
                    />
                    ))}
                </View>
            </View>
        )}

        <View style={[
            styles.mapSectionContainer, 
            isFullScreenMode && styles.mapSectionFull 
        ]}>
            <View style={styles.mapHeaderRow}>
                {isFullScreenMode ? (
                    <TouchableOpacity onPress={exitNavigation} style={styles.backButton}>
                         <Ionicons name="arrow-back" size={20} color="#333" />
                         <Text style={[styles.backButtonText, {color: '#333'}]}>Voltar</Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.sectionTitleNoPadding}>Mapa de Vagas</Text>
                )}
                
                {!isFullScreenMode && (
                    <TouchableOpacity onPress={toggleMapExpansion} style={styles.expandButton}>
                        <Text style={[styles.seeAllText, {color: '#B45309'}]}>Expandir</Text>
                        <Ionicons name="expand" size={16} color="#B45309" style={{marginLeft: 4}}/>
                    </TouchableOpacity>
                )}
            </View>
            
            <View style={[
                styles.mapWrapper, 
                isFullScreenMode && { height: expandedHeight }
            ]}>
                <WebView
                    ref={webViewRef}
                    originWhitelist={['*']}
                    source={{ html: mapHtml }}
                    style={styles.mapWebView}
                    scrollEnabled={false}
                    nestedScrollEnabled={true}
                    javaScriptEnabled={true}
                    onMessage={handleWebViewMessage}
                />
                
                {viewMode === 'navigation' && activeRouteParking && (
                    <>
                        <View style={styles.navTopBar}>
                             <View style={styles.navInstructionBox}>
                                <Ionicons name="return-up-forward" size={32} color="#fff" />
                                <View style={{marginLeft: 12}}>
                                    <Text style={styles.navInstructionDistance}>{activeRouteParking.distance}</Text>
                                    <Text style={styles.navInstructionText}>Siga para {activeRouteParking.name}</Text>
                                </View>
                             </View>
                        </View>

                        <TouchableOpacity style={styles.cancelRouteButton} onPress={exitNavigation}>
                            <Ionicons name="close-circle" size={28} color="#fff" />
                            <Text style={styles.cancelRouteText}>Cancelar Rota</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>

        {!isFullScreenMode && (
            <>
                <View style={styles.recommendationsContainer}>
                <Text style={styles.sectionTitle}>
                    {searchText || selectedFilters.length > 0 ? "Resultados da Busca" : "Recomendados na Região"}
                </Text>
                
                {filteredData.length === 0 ? (
                    <View style={{ alignItems: 'center', marginTop: 30 }}>
                        <Ionicons name="search-outline" size={48} color="#ddd" />
                        <Text style={{textAlign: 'center', color: '#666', marginTop: 10}}>
                            Nenhum estacionamento encontrado.
                        </Text>
                    </View>
                ) : (
                    filteredData.map((parking) => (
                        <ParkingCard 
                            key={parking.id} 
                            parking={parking} 
                            onPress={() => handleCardPress(parking)}
                            onReserve={() => handleReservePress(parking)}
                        />
                    ))
                )}
                </View>
            </>
        )}

        <RouteConfirmationModal 
            visible={routeModalVisible}
            parking={selectedParking}
            onCancel={() => setRouteModalVisible(false)}
            onConfirm={confirmNavigation}
        />

        <ReservationModal
            visible={reservationModalVisible}
            parking={selectedParking}
            onCancel={() => setReservationModalVisible(false)}
            onConfirm={confirmReservation}
        />

        <SuccessModal 
            visible={successModalVisible}
            onClose={() => setSuccessModalVisible(false)}
        />

        <ActiveReservationDetailsModal
            visible={activeDetailsVisible}
            reservation={activeReservation}
            onClose={() => setActiveDetailsVisible(false)}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");
const PADDING = width * 0.05;

const PRIMARY_COLOR = "#F5B301";
const TEXT_COLOR = "#1A1A1A";
const SUBTEXT = "#6B7280";
const CARD_BG = "#FFFFFF";
const LIGHT_BG = "#F8F8F8";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: '#FFFBEA',
    opacity: 0.3,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  topContentOverlay: {
    backgroundColor: "rgba(255,255,255,0.6)",
    paddingBottom: 10,
    marginBottom: 0,
    ...(Platform.OS === "ios" ? { shadowOpacity: 0 } : { elevation: 0 }),
  },
  header: {
    paddingHorizontal: PADDING,
    paddingVertical: 22,
  },
  greetingTitle: {
    fontSize: 30,
    fontWeight: "900",
    paddingTop: 10,
    color: TEXT_COLOR,
    letterSpacing: -0.7,
  },
  greetingSubtitle: {
    fontSize: 16,
    color: SUBTEXT,
    opacity: 0.85,
    marginTop: 4,
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: PADDING,
    marginBottom: 20,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E7E7E7",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  searchBarInput: {
    flex: 1,
    fontSize: 16,
    color: TEXT_COLOR,
    marginLeft: 10,
  },
  locationButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 16,
    padding: 15,
    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 8,
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: PADDING,
    marginTop: 0,
    marginBottom: 25,
  },
  quickActionButton: {
    alignItems: "center",
    width: (width - PADDING * 2 - 40) / 4,
  },
  quickActionButtonSelected: {
    transform: [{ scale: 1.05 }],
  },
  quickActionIconContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 24,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  quickActionIconSelected: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: "600",
    color: SUBTEXT,
    textAlign: 'center',
  },
  quickActionTextSelected: {
    color: '#B45309',
    fontWeight: "800",
  },
  mapSectionContainer: {
    marginBottom: 30,
    paddingHorizontal: PADDING,
  },
  mapSectionFull: {
    width: 390,
    marginBottom: 0,
    paddingLeft: 5,
    marginTop: -280, 
    flex: 1,
    justifyContent: 'center', 
},
  mapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 0,
    minHeight: 30,
  },
  expandButton: {
      flexDirection: 'row', 
      alignItems: 'center',
      backgroundColor: '#FFF8E1',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
  },
  backButton: {
      flexDirection: 'row', 
      alignItems: 'center',
      backgroundColor: '#FFF',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#eee',
      shadowColor: "#000",
      shadowOpacity: 0.05,
      elevation: 2,
  },
  backButtonText: {
      color: PRIMARY_COLOR,
      fontWeight: '700',
      fontSize: 14,
      marginLeft: 4,
  },
  seeAllText: {
      color: '#B45309',
      fontWeight: '700',
      fontSize: 13,
  },
  mapWrapper: {
    height: 280,
    width: '100%',
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#E5E5E5',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  mapWebView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  navTopBar: {
      position: 'absolute',
      top: 20,
      left: 20,
      right: 20,
      backgroundColor: PRIMARY_COLOR,
      borderRadius: 16,
      padding: 20,
      shadowColor: "#000",
      shadowOpacity: 0.2,
      elevation: 8,
  },
  navInstructionBox: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  navInstructionDistance: {
      color: '#fff',
      fontSize: 24,
      fontWeight: '800',
  },
  navInstructionText: {
      color: 'rgba(255,255,255,0.9)',
      fontSize: 16,
      fontWeight: '500',
  },
  cancelRouteButton: {
      position: 'absolute',
      bottom: 10,
      alignSelf: 'center',
      backgroundColor: '#DC2626', 
      paddingVertical: 14,
      paddingHorizontal: 30,
      borderRadius: 30,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: "#000",
      shadowOpacity: 0.4,
      shadowOffset: {width: 0, height: 6},
      elevation: 8,
      zIndex: 100,
  },
  cancelRouteText: {
      color: 'white',
      marginLeft: 10,
      fontWeight: '800',
      fontSize: 16,
      textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: TEXT_COLOR,
    paddingHorizontal: PADDING,
    marginBottom: 18,
    letterSpacing: -0.4,
  },
  sectionTitleNoPadding: {
    fontSize: 22,
    fontWeight: "900",
    color: TEXT_COLOR,
    letterSpacing: -0.4,
  },
  carouselContainer: {
    marginBottom: 40,
  },
  carousel: {
    paddingLeft: PADDING,
  },
  carouselImage: {
    width: width * 0.85,
    height: 180,
    borderRadius: 22,
    marginRight: 16,
    backgroundColor: '#eee',
  },
  recommendationsContainer: {
    paddingHorizontal: PADDING,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    marginBottom: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F3F3F3",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  cardImage: {
    width: "100%",
    height: 180,
    backgroundColor: '#eee',
  },
  cardContent: {
    padding: 20,
  },
  cardHeaderRow: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: TEXT_COLOR,
    letterSpacing: -0.3,
  },
  ratingDistanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    justifyContent: "space-between",
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  ratingText: {
    fontSize: 13,
    color: "#fff",
    marginLeft: 4,
    fontWeight: "800",
  },
  dotSeparator: {
      color: '#ddd',
      marginHorizontal: 8,
  },
  distanceText: {
    fontSize: 14,
    color: SUBTEXT,
    fontWeight: "600",
    flex: 1,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: LIGHT_BG,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  newPriceLabel: {
    fontSize: 11,
    color: SUBTEXT,
    marginRight: 4,
    fontWeight: "600",
  },
  newPriceText: {
    fontSize: 15,
    fontWeight: "900",
    color: PRIMARY_COLOR,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 18,
  },
  tag: {
    backgroundColor: LIGHT_BG,
    fontSize: 11,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    marginRight: 6,
    marginBottom: 6,
    fontWeight: "700",
    color: TEXT_COLOR,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  spotsText: {
    fontSize: 14,
    color: SUBTEXT,
  },
  spotsCount: {
    fontSize: 16,
    fontWeight: "900",
    color: TEXT_COLOR,
  },
  reserveButton: {
    flexDirection: "row",
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  reserveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  // ESTILOS DOS MODAIS
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalIconContainer: {
    backgroundColor: '#FFF8E1',
    padding: 16,
    borderRadius: 50,
    marginBottom: 16,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: TEXT_COLOR,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: SUBTEXT,
    textAlign: 'center',
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    width: '100%',
  },
  modalInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    backgroundColor: LIGHT_BG,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  modalInfoText: {
    marginLeft: 6,
    fontWeight: '600',
    color: TEXT_COLOR,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 14,
    marginRight: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  modalButtonCancelText: {
    color: SUBTEXT,
    fontWeight: '700',
    fontSize: 16,
  },
  modalButtonConfirm: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 14,
    marginLeft: 10,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  modalButtonConfirmText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  activeResCard: {
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: '#E0F2FE',
      borderLeftWidth: 5,
      borderLeftColor: '#0EA5E9',
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
  },
  activeResHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
  },
  activeResTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: '#0EA5E9',
      textTransform: 'uppercase',
  },
  activeResBadge: {
      backgroundColor: '#E0F2FE',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
  },
  activeResBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#0EA5E9',
  },
  activeResName: {
      fontSize: 18,
      fontWeight: '800',
      color: TEXT_COLOR,
      marginBottom: 4,
  },
  activeResTimeRow: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  activeResTimeText: {
      marginLeft: 6,
      fontSize: 14,
      fontWeight: '600',
      color: SUBTEXT,
  },
  timeBox: {
      backgroundColor: '#F3F4F6',
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      width: '40%',
  },
  timeLabel: {
      fontSize: 12,
      color: '#6B7280',
      marginBottom: 4,
  },
  timeValue: {
      fontSize: 18,
      fontWeight: '700',
      color: '#111827',
  },
  inputLabel: {
      fontSize: 14,
      color: '#666',
      marginBottom: 8,
      fontWeight: '600',
      marginTop: 10,
  },
  inputTouchable: {
      backgroundColor: '#F3F4F6',
      borderRadius: 12,
      padding: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  inputText: {
      fontSize: 16,
      color: '#111827',
      fontWeight: '500',
  },
  timeTouchable: {
      width: '100%',
      alignItems: 'center',
  },
  detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
      fontSize: 14,
      color: '#6B7280',
      fontWeight: '500',
  },
  detailValue: {
      fontSize: 14,
      color: '#111827',
      fontWeight: '700',
  },
  calendarHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginBottom: 20,
  },
  calendarTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#333',
  },
  calendarArrow: {
      padding: 10,
  },
  weekDaysContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 10,
      paddingHorizontal: 10,
  },
  weekDayText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#999',
      width: 36,
      textAlign: 'center',
  },
  calendarDayItem: {
      width: 36,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F3F4F6',
      borderRadius: 18,
      margin: 4,
  },
  calendarDayItemEmpty: {
      width: 36,
      height: 36,
      margin: 4,
  },
  calendarDayText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#333',
  },
});