import { useEffect, useState } from "react";

const useCookie = (cookieName) => {
    const [cookieValue, setCookieValue] = useState("");
    const date = new Date();
    date.setDate(date.getDate()+Math.abs(7));

    useEffect(() => {
        const cookie = document.cookie
            .split("; ")
            .find((row) => row.startsWith(`${cookieName}=`));
        
        setCookieValue(cookie ? cookie.split("=")[1] : "");
    },[cookieName]);

    const setCookie = (value) => {
        document.cookie = `${cookieName}=${value}; expires=${date.toUTCString()}; path=/`;
    };

    const deleteCookie = () => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    };

    return [cookieValue, setCookie, deleteCookie];
};

export default useCookie;