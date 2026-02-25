'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface SidebarContextType {
    isOpen: boolean;
    isCollapsed: boolean; // desktop collapsed state
    toggle: () => void;       // mobile: open/close drawer
    toggleCollapse: () => void; // desktop: expand/collapse
    close: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
    isOpen: false,
    isCollapsed: false,
    toggle: () => { },
    toggleCollapse: () => { },
    close: () => { },
});

export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);       // mobile drawer
    const [isCollapsed, setIsCollapsed] = useState(false); // desktop collapsed

    const toggle = useCallback(() => setIsOpen(v => !v), []);
    const toggleCollapse = useCallback(() => setIsCollapsed(v => !v), []);
    const close = useCallback(() => setIsOpen(false), []);

    // Close mobile drawer on resize to desktop
    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth >= 1024) setIsOpen(false);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return (
        <SidebarContext.Provider value={{ isOpen, isCollapsed, toggle, toggleCollapse, close }}>
            {children}
        </SidebarContext.Provider>
    );
};
