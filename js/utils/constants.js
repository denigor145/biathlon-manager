// js/utils/constants.js - НЕПРЕРЫВНАЯ СИСТЕМА
const GameConstants = {
    // Версия игры
    VERSION: '3.0.0',
    
    // Система обновления
    UPDATE: {
        INTERVAL: 100, // 100мс между обновлениями для плавности
        TIME_STEP: 0.1, // 0.1 секунды за обновление
        RACE_SPEED: 1.0
    },
    
    // Настройки игрока
    PLAYER: {
        // Скорости (м/с) - реальные скорости биатлонистов
        MIN_SPEED: 4.44,     // 16 км/ч
        MAX_SPEED: 7.78,     // 28 км/ч
        
        // Выносливость
        MAX_STAMINA: 100,
        STAMINA_RECOVERY_RATE: 2.0,
        STAMINA_DRAIN_RATES: {
            1: -2.0,
            2: -1.0,  
            3: 0.0,
            4: 1.0,
            5: 2.0,
            6: 3.0,
            7: 4.0
        },
        
        // Пульс
        MIN_PULSE: 80,
        MAX_PULSE: 200,
        PULSE_INCREASE_RATE: 0.5,
        PULSE_DECREASE_RATE: 0.3,
        
        // Точность стрельбы
        MIN_ACCURACY: 0.5,
        MAX_ACCURACY: 0.95,
        PULSE_ACCURACY_PENALTY: 0.003,
    },
    
    // Уровни интенсивности
    INTENSITY_LEVELS: {
        1: { name: "Восстановление", speedModifier: 0.7, staminaEffect: -2.0 },
        2: { name: "Спокойный", speedModifier: 0.85, staminaEffect: -1.0 },
        3: { name: "Стабильный", speedModifier: 1.0, staminaEffect: 0.0 },
        4: { name: "Средний", speedModifier: 1.1, staminaEffect: 1.0 },
        5: { name: "Быстрый", speedModifier: 1.25, staminaEffect: 2.0 },
        6: { name: "Очень быстрый", speedModifier: 1.4, staminaEffect: 3.0 },
        7: { name: "Спринт", speedModifier: 1.6, staminaEffect: 4.0 }
    },
    
    // Ограничения по выносливости для уровней интенсивности
    STAMINA_RESTRICTIONS: {
        5: 30,
        6: 40,  
        7: 50
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
        PENALTY_LOOP_LENGTH: 150,
        WIND_EFFECT: 0.1,
        TRACK_CONDITION_EFFECT: 0.15,
        RANDOM_VARIATION: 0.1,
        TIME_MULTIPLIER: 10.0 // МНОЖИТЕЛЬ ВРЕМЕНИ ДЛЯ УСКОРЕНИЯ ГОНКИ
    },
    
    // Настройки стрельбы
    SHOOTING: {
        SHOTS_PER_ROUND: 5,
        MIN_SHOOTING_INTERVAL: 3.0,
        MAX_SHOOTING_INTERVAL: 6.0,
        PRONE_ACCURACY_BONUS: 1.1,
        STANDING_ACCURACY_PENALTY: 0.9,
        WIND_ACCURACY_EFFECT: 0.05,
    },
    
    // Типы гонок - РЕАЛЬНЫЕ ДИСТАНЦИИ БИАТЛОНА
    RACE_TYPES: {
        SPRINT: {
            name: "Спринт",
            lapDistance: 3300,
            totalLaps: 3,
            totalDistance: 9900,
            shootingRounds: [
                { afterLap: 1, position: "prone", name: "Стрельба лёжа" },
                { afterLap: 2, position: "standing", name: "Стрельба стоя" }
            ],
            penaltyType: 'loops',
            penaltyLoopDistance: 150,
            description: "Короткая быстрая гонка с 2 стрельбами"
        },
        
        PURSUIT: {
            name: "Гонка преследования", 
            lapDistance: 2500,
            totalLaps: 5,
            totalDistance: 12500,
            shootingRounds: [
                { afterLap: 1, position: "prone", name: "Стрельба лёжа 1" },
                { afterLap: 2, position: "prone", name: "Стрельба лёжа 2" },
                { afterLap: 3, position: "standing", name: "Стрельба стоя 1" },
                { afterLap: 4, position: "standing", name: "Стрельба стоя 2" }
            ],
            penaltyType: 'loops',
            penaltyLoopDistance: 150,
            description: "Средняя дистанция с 4 стрельбами"
        },
        
        MASS: {
            name: "Масс-старт",
            lapDistance: 3000, 
            totalLaps: 5,
            totalDistance: 15000,
            shootingRounds: [
                { afterLap: 1, position: "prone", name: "Стрельба лёжа 1" },
                { afterLap: 2, position: "prone", name: "Стрельба лёжа 2" },
                { afterLap: 3, position: "standing", name: "Стрельба стоя 1" },
                { afterLap: 4, position: "standing", name: "Стрельба стоя 2" }
            ],
            penaltyType: 'loops',
            penaltyLoopDistance: 150,
            description: "Длинная дистанция с 4 стрельбами"
        },
        
        INDIVIDUAL: {
            name: "Индивидуальная гонка",
            lapDistance: 4000,
            totalLaps: 5, 
            totalDistance: 20000,
            shootingRounds: [
                { afterLap: 1, position: "prone", name: "Стрельба лёжа 1" },
                { afterLap: 2, position: "standing", name: "Стрельба стоя 1" },
                { afterLap: 3, position: "prone", name: "Стрельба лёжа 2" },
                { afterLap: 4, position: "standing", name: "Стрельба стоя 2" }
            ],
            penaltyType: 'minutes',
            penaltyPerMiss: 60,
            description: "Самая длинная дистанция с 4 стрельбами"
        }
    },
    
    // Состояния игрока
    PLAYER_STATES: {
        START: 'start',
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
        BRONZE: '#CD7F32',
        STAMINA_LOW: '#FF5252',
        STAMINA_MEDIUM: '#FF9800',
        STAMINA_HIGH: '#4CAF50'
    },
    
    // Сообщения
    MESSAGES: {
        NOT_ENOUGH_STAMINA: 'Недостаточно выносливости!',
        STAT_MAXED: 'Характеристика уже максимальная!',
        STAT_MINIMUM: 'Характеристика уже минимальная!',
        NOT_ENOUGH_POINTS: 'Недостаточно очков для улучшения!',
        RACE_FINISHED: 'Гонка завершена!',
        NEW_RECORD: '🎉 Новый рекорд!',
        VICTORY: '🥇 ПОБЕДА!',
        SECOND_PLACE: '🥈 Второе место!',
        THIRD_PLACE: '🥉 Третье место!',
        PENALTY_LOOP_START: '⏱️ Начало штрафных кругов',
        PENALTY_LOOP_END: '✅ Штрафные круги завершены',
        SHOOTING_START: '🎯 Начало стрельбы',
        SHOOTING_FINISH: '✅ Стрельба завершена'
    },
    
    // События
    EVENTS: {
        RACE_START: 'raceStart',
        RACE_FINISH: 'raceFinish',
        RACE_PAUSE: 'racePause',
        RACE_RESUME: 'raceResume',
        SHOOTING_START: 'shootingStart',
        SHOOTING_FINISH: 'shootingFinish',
        PENALTY_START: 'penaltyStart',
        PENALTY_FINISH: 'penaltyFinish',
        LAP_COMPLETED: 'lapCompleted',
        INTENSITY_CHANGED: 'intensityChanged',
        STAMINA_LOW: 'staminaLow'
    },
    
    // Локации
    LOCATIONS: [
        { 
            id: 0, 
            name: "Новичковый стадион", 
            minLevel: 0, 
            maxLevel: 9, 
            difficulty: 1, 
            botMinLevel: 0, 
            botMaxLevel: 5,
            windStrength: 0.1,
            trackCondition: 0.9
        },
        { 
            id: 1, 
            name: "Горный курорт", 
            minLevel: 10, 
            maxLevel: 19, 
            difficulty: 2, 
            botMinLevel: 4, 
            botMaxLevel: 8,
            windStrength: 0.2,
            trackCondition: 0.85
        },
        { 
            id: 2, 
            name: "Лесная трасса", 
            minLevel: 20, 
            maxLevel: 29, 
            difficulty: 3, 
            botMinLevel: 9, 
            botMaxLevel: 15,
            windStrength: 0.15,
            trackCondition: 0.8
        },
        { 
            id: 3, 
            name: "Альпийский центр", 
            minLevel: 30, 
            maxLevel: 39, 
            difficulty: 4, 
            botMinLevel: 10, 
            botMaxLevel: 18,
            windStrength: 0.25,
            trackCondition: 0.75
        },
        { 
            id: 4, 
            name: "Северный полюс", 
            minLevel: 40, 
            maxLevel: 49, 
            difficulty: 5, 
            botMinLevel: 15, 
            botMaxLevel: 20,
            windStrength: 0.3,
            trackCondition: 0.7
        },
        { 
            id: 5, 
            name: "Олимпийский комплекс", 
            minLevel: 50, 
            maxLevel: 59, 
            difficulty: 6, 
            botMinLevel: 20, 
            botMaxLevel: 25,
            windStrength: 0.2,
            trackCondition: 0.95
        },
        { 
            id: 6, 
            name: "Мировой кубок", 
            minLevel: 60, 
            maxLevel: 69, 
            difficulty: 7, 
            botMinLevel: 24, 
            botMaxLevel: 30,
            windStrength: 0.15,
            trackCondition: 0.9
        },
        { 
            id: 7, 
            name: "Чемпионат мира", 
            minLevel: 70, 
            maxLevel: 79, 
            difficulty: 8, 
            botMinLevel: 30, 
            botMaxLevel: 40,
            windStrength: 0.25,
            trackCondition: 0.85
        },
        { 
            id: 8, 
            name: "Элитная лига", 
            minLevel: 80, 
            maxLevel: 89, 
            difficulty: 9, 
            botMinLevel: 35, 
            botMaxLevel: 50,
            windStrength: 0.3,
            trackCondition: 0.8
        },
        { 
            id: 9, 
            name: "Легендарная арена", 
            minLevel: 90, 
            maxLevel: 99, 
            difficulty: 10, 
            botMinLevel: 50, 
            botMaxLevel: 70,
            windStrength: 0.35,
            trackCondition: 0.75
        }
    ]
};

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameConstants };
}
