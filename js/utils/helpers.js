// Вспомогательные функции для игры

class GameHelpers {
    // Форматирование времени
    static formatTime(seconds) {
        if (seconds < 0) return '0:00.0';
        
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(1);
        return `${mins}:${secs.padStart(4, '0')}`;
    }
    
    // Форматирование короткого имени
    static formatShortName(fullName) {
        const parts = fullName.split(' ');
        if (parts.length >= 2) {
            return parts[0] + ' ' + parts[1].charAt(0) + '.';
        }
        return fullName;
    }
    
    // Генерация случайного числа в диапазоне
    static randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    // Генерация случайного целого числа в диапазоне
    static randomIntBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // Ограничение числа в диапазоне
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    
    // Линейная интерполяция
    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    // Форматирование процентов
    static formatPercent(value) {
        return Math.round(value * 100) + '%';
    }
    
    // Форматирование дистанции
    static formatDistance(meters) {
        if (meters < 1000) {
            return meters + ' м';
        } else {
            return (meters / 1000).toFixed(2) + ' км';
        }
    }
    
    // Расчет скорости в км/ч из м/с
    static mpsToKmh(mps) {
        return (mps * 3.6).toFixed(1);
    }
    
    // Расчет скорости в м/с из км/ч
    static kmhToMps(kmh) {
        return (kmh / 3.6).toFixed(2);
    }
    
    // Проверка поддержки localStorage
    static supportsLocalStorage() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    // Сохранение данных в localStorage с обработкой ошибок
    static saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Ошибка сохранения ${key}:`, error);
            return false;
        }
    }
    
    // Загрузка данных из localStorage с обработкой ошибок
    static loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Ошибка загрузки ${key}:`, error);
            return null;
        }
    }
    
    // Удаление данных из localStorage
    static removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Ошибка удаления ${key}:`, error);
            return false;
        }
    }
    
    // Создание уникального ID
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Анимация плавного появления
    static fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = null;
        
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.min(progress / duration, 1);
            
            element.style.opacity = opacity.toString();
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    // Анимация плавного исчезновения
    static fadeOut(element, duration = 300) {
        let start = null;
        const initialOpacity = parseFloat(element.style.opacity) || 1;
        
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = initialOpacity * (1 - Math.min(progress / duration, 1));
            
            element.style.opacity = opacity.toString();
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    // Виброотдача (если поддерживается)
    static vibrate(duration = 100) {
        if (navigator.vibrate) {
            navigator.vibrate(duration);
        }
    }
    
    // Проверка мобильного устройства
    static isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    // Предотвращение скролла на мобильных устройствах
    static preventScroll() {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
    }
    
    // Разрешение скролла
    static allowScroll() {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
    }
    
    // Создание элемента с заданными стилями
    static createElement(tag, styles = {}, attributes = {}) {
        const element = document.createElement(tag);
        
        // Применяем стили
        Object.keys(styles).forEach(property => {
            element.style[property] = styles[property];
        });
        
        // Устанавливаем атрибуты
        Object.keys(attributes).forEach(attr => {
            element.setAttribute(attr, attributes[attr]);
        });
        
        return element;
    }
    
    // Показ временного сообщения
    static showTemporaryMessage(message, type = 'info', duration = 3000) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: bold;
            z-index: 10000;
            transition: all 0.3s ease;
            max-width: 80%;
            text-align: center;
            color: white;
        `;
        
        switch(type) {
            case 'success':
                messageDiv.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32)';
                break;
            case 'error':
                messageDiv.style.background = 'linear-gradient(135deg, #F44336, #C62828)';
                break;
            case 'warning':
                messageDiv.style.background = 'linear-gradient(135deg, #FF9800, #F57C00)';
                break;
            default:
                messageDiv.style.background = 'linear-gradient(135deg, #2196F3, #1565C0)';
        }
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, duration);
    }
    
    // Расчет времени прохождения дистанции
    static calculateRaceTime(distance, speedMps) {
        return distance / speedMps;
    }
    
    // Расчет времени стрельбы
    static calculateShootingTime(shootingInterval) {
        return shootingInterval * 5; // 5 выстрелов
    }
    
    // Получение модификатора точности для положения стрельбы
    static getShootingPositionModifier(position) {
        switch(position) {
            case 'prone':
                return 1.1; // +10% к точности лёжа
            case 'standing':
                return 0.9; // -10% к точности стоя
            default:
                return 1.0;
        }
    }
    
    // Генерация случайного имени бота
    static generateBotName() {
        const names = [
            "Йоханссон", "Мюллер", "Мартен", "Ларссон", "Хубер", 
            "Бё", "Фуркад", "Самуэльссон", "Семёнов", "Пидно",
            "Уле", "Бьорндален", "Ландертингер", "Ферри", "Вайдель", "Логинов"
        ];
        return names[Math.floor(Math.random() * names.length)];
    }
    
    // Генерация случайного флага
    static generateBotFlag() {
        const flags = ["🇳🇴", "🇩🇪", "🇫🇷", "🇸🇪", "🇦🇹", "🇫🇮", "🇮🇹", "🇨🇭", "🇷🇺", "🇺🇦", "🇨🇿", "🇸🇰", "🇧🇾", "🇰🇿", "🇨🇦", "🇺🇸"];
        return flags[Math.floor(Math.random() * flags.length)];
    }
    
    // Проверка, является ли устройство сенсорным
    static isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    
    // Добавление обработчика с поддержкой touch и click
    static addUniversalEventListener(element, event, handler) {
        if (this.isTouchDevice()) {
            element.addEventListener('touchstart', handler);
        } else {
            element.addEventListener('click', handler);
        }
    }
    
    // Форматирование числа с разделителями тысяч
    static formatNumber(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    // Получение случайного элемента из массива
    static getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    // Перемешивание массива (Fisher-Yates shuffle)
    static shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
}
