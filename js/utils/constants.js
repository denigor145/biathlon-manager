// Константы игры

const GameConstants = {
    // Версия игры
    VERSION: '2.0.0',
    
    // Настройки игрока
    PLAYER: {
        BASE_SPEED: 2.78,           // Базовая скорость в м/с (10 км/ч)
        MAX_SPEED: 5.0,             // Максимальная скорость в м/с (18 км/ч)
        BASE_STAMINA: 60,
        MAX_STAMINA: 150,
        BASE_ACCURACY: 0.1,         // Базовая точность (10%)
        MAX_ACCURACY: 0.95,         // Максимальная точность (95%)
        BASE_SHOOTING_INTERVAL: 6.0, // Базовый интервал между выстрелами (секунды)
        MIN_SHOOTING_INTERVAL: 3.0,  // Минимальный интервал между выстрелами
        MIN_PULSE: 80,
        MAX_PULSE: 200
    },
    
    // Настройки характеристик
    STATS: {
        MIN_RUNNING_SPEED: 0,
        MAX_RUNNING_SPEED: 60,
        MIN_ACCURACY: 0,
        MAX_ACCURACY: 60,
        MIN_SHOOTING_SPEED: 0,
        MAX_SHOOTING_SPEED: 60,
        MIN_STAMINA: 0,
        MAX_STAMINA: 60,
        STARTING_POINTS: 60
    },
    
    // Настройки гонки
    RACE: {
        SEGMENT_LENGTH: 150,        // Длина отрезка в метрах
        PENALTY_LOOP_LENGTH: 150,   // Длина штрафного круга в метрах
        UPDATE_INTERVAL: 2000,      // Интервал обновления гонки (мс)
        SPRINT_DURATION: 6000,      // Длительность спринта (мс)
        SPRINT_SPEED_BOOST: 1.0,    // Бонус скорости при спринте (м/с)
        SPRINT_STAMINA_COST: 15,    // Стоимость выносливости за спринт
        SLOW_PACE_STAMINA_GAIN: 10, // Восстановление выносливости при медленном темпе
        SLOW_PACE_SPEED_REDUCTION: 0.5 // Снижение скорости при медленном темпе
    },
    
    // Настройки стрельбы
    SHOOTING: {
        SHOTS_PER_ROUND: 5,
        PRONE_ACCURACY_BONUS: 1.1,  // +10% к точности лёжа
        STANDING_ACCURACY_PENALTY: 0.9, // -10% к точности стоя
        PENALTY_LOOP_PER_MISS: 1,   // 1 штрафной круг за промах
        PENALTY_MINUTE_PER_MISS: 1  // 1 штрафная минута за промах (индивидуальная гонка)
    },
    
    // Типы гонок
    RACE_TYPES: {
        SPRINT: 'sprint',
        PURSUIT: 'pursuit', 
        MASS: 'mass',
        INDIVIDUAL: 'individual'
    },
    
    // Состояния игрока
    PLAYER_STATES: {
        RACING: 'racing',
        SHOOTING: 'shooting',
        PENALTY_LOOP: 'penalty_loop',
        FINISHED: 'finished'
    },
    
    // Ключи localStorage
    STORAGE_KEYS: {
        PLAYER_PROFILE: 'biathlonPlayerProfile',
        RACE_HISTORY: 'biathlonRaceHistory',
        GAME_SETTINGS: 'biathlonGameSettings'
    },
    
    // Цвета интерфейса
    COLORS: {
        PRIMARY: '#1e3c72',
        SECONDARY: '#2a5298',
        ACCENT: '#4FC3F7',
        SUCCESS: '#4CAF50',
        WARNING: '#FF9800',
        ERROR: '#F44336',
        GOLD: '#FFD700',
        SILVER: '#C0C0C0',
        BRONZE: '#CD7F32'
    },
    
    // Сообщения
    MESSAGES: {
        NOT_ENOUGH_STAMINA: 'Недостаточно выносливости для спринта!',
        STAT_MAXED: 'Характеристика уже максимальная!',
        STAT_MINIMUM: 'Характеристика уже минимальная!',
        NOT_ENOUGH_POINTS: 'Недостаточно очков для улучшения!',
        RACE_FINISHED: 'Гонка завершена!',
        NEW_RECORD: '🎉 Новый рекорд!',
        VICTORY: '🥇 ПОБЕДА!',
        SECOND_PLACE: '🥈 Второе место!',
        THIRD_PLACE: '🥉 Третье место!'
    },
    
    // События
    EVENTS: {
        RACE_START: 'raceStart',
        RACE_FINISH: 'raceFinish',
        SHOOTING_START: 'shootingStart',
        SHOOTING_FINISH: 'shootingFinish',
        STAT_CHANGED: 'statChanged',
        POSITION_CHANGED: 'positionChanged',
        LAP_COMPLETED: 'lapCompleted',
        SEGMENT_COMPLETED: 'segmentCompleted'
    },
    
    // Локации
    LOCATIONS: [
        { id: 0, name: "Новичковый стадион", minLevel: 0, maxLevel: 9, difficulty: 1, botMinLevel: 0, botMaxLevel: 5 },
        { id: 1, name: "Горный курорт", minLevel: 10, maxLevel: 19, difficulty: 2, botMinLevel: 4, botMaxLevel: 8 },
        { id: 2, name: "Лесная трасса", minLevel: 20, maxLevel: 29, difficulty: 3, botMinLevel: 9, botMaxLevel: 15 },
        { id: 3, name: "Альпийский центр", minLevel: 30, maxLevel: 39, difficulty: 4, botMinLevel: 10, botMaxLevel: 18 },
        { id: 4, name: "Северный полюс", minLevel: 40, maxLevel: 49, difficulty: 5, botMinLevel: 15, botMaxLevel: 20 },
        { id: 5, name: "Олимпийский комплекс", minLevel: 50, maxLevel: 59, difficulty: 6, botMinLevel: 20, botMaxLevel: 25 },
        { id: 6, name: "Мировой кубок", minLevel: 60, maxLevel: 69, difficulty: 7, botMinLevel: 24, botMaxLevel: 30 },
        { id: 7, name: "Чемпионат мира", minLevel: 70, maxLevel: 79, difficulty: 8, botMinLevel: 30, botMaxLevel: 40 },
        { id: 8, name: "Элитная лига", minLevel: 80, maxLevel: 89, difficulty: 9, botMinLevel: 35, botMaxLevel: 50 },
        { id: 9, name: "Легендарная арена", minLevel: 90, maxLevel: 99, difficulty: 10, botMinLevel: 50, botMaxLevel: 70 }
    ]
};

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameConstants };
}
