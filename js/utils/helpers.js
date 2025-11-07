// Вспомогательные функции для игры

class GameHelpers {
    // Форматирование времени
    static formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(1);
        return `${mins.toString().padStart(2, '0')}:${secs.padStart(4, '0')}`;
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
}
