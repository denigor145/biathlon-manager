// Константы игры

const GameConstants = {
    // Версия игры
    VERSION: '1.0.0',
    
    // Настройки игрока
    PLAYER: {
        BASE_SPEED: 5,
        BASE_STAMINA: 100,
        BASE_ACCURACY: 70,
        BASE_SHOOTING_SPEED: 2.0,
        MIN_STAMINA: 0,
        MAX_STAMINA: 150,
        MIN_PULSE: 80,
        MAX_PULSE: 200
    },
    
    // Настройки характеристик
    STATS: {
        MIN_RUNNING_SPEED: 3,
        MAX_RUNNING_SPEED: 8,
        MIN_ACCURACY: 50,
        MAX_ACCURACY: 95,
        MIN_SHOOTING_SPEED: 1.0,
        MAX_SHOOTING_SPEED: 3.5,
        MIN_STAMINA: 60,
        MAX_STAMINA: 150
    },
    
    // Настройки стрельбы
    SHOOTING: {
        BASE_SHOOTING_TIME: 15000, // 15 секунд на 5 выстрелов
        PENALTY_PER_MISS: 10, // 10 секунд штрафа за промах
        WIND_MODIFIERS: {
            NONE: 1.0,
            LIGHT: 0.95,
            MODERATE: 0.9,
            STRONG: 0.8
        }
    },
    
    // Настройки гонки
    RACE: {
        SEGMENT_DURATION: 2000, // 2 секунды на сегмент
        SPRINT_DURATION: 6000, // 6 секунд длится спринт
        SPRINT_SPEED_BOOST: 2,
        SPRINT_STAMINA_COST: 15,
        SLOW_PACE_STAMINA_GAIN: 10,
        SLOW_PACE_SPEED_REDUCTION: 1
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
        GOLD: '#FFD700'
    },
    
    // Сообщения
    MESSAGES: {
        NOT_ENOUGH_STAMINA: 'Недостаточно выносливости для спринта!',
        STAT_MAXED: 'Характеристика уже максимальная!',
        STAT_MINIMUM: 'Характеристика уже минимальная!',
        NOT_ENOUGH_POINTS: 'Недостаточно очков для улучшения!',
        RACE_FINISHED: 'Гонка завершена!'
    },
    
    // События
    EVENTS: {
        RACE_START: 'raceStart',
        RACE_FINISH: 'raceFinish',
        SHOOTING_START: 'shootingStart',
        SHOOTING_FINISH: 'shootingFinish',
        STAT_CHANGED: 'statChanged',
        POSITION_CHANGED: 'positionChanged'
    }
};

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameConstants, GameHelpers };
}
