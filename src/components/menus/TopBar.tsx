import React from "react";
import { format } from "date-fns";
import { AnimatePresence } from "framer-motion";
import { isFullScreen } from "~/utils";
import type { MacActions } from "~/types";
import { useAudioContext } from "~/context/AudioContext";

interface TopBarItemProps {
  hideOnMobile?: boolean;
  forceHover?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
}

const TopBarItem = forwardRef(
  (props: TopBarItemProps, ref: React.ForwardedRef<HTMLDivElement>) => {
    const hide = props.hideOnMobile ? "hidden sm:inline-flex" : "inline-flex";
    const bg = props.forceHover
      ? "bg-white/10 dark:bg-white/15"
      : "hover:(bg-white/10 dark:bg-white/15)";

    return (
      <div
        ref={ref}
        className={`hstack space-x-1 h-6 px-1.5 cursor-default rounded ${hide} ${bg} ${
          props.className || ""
        }`}
        style={{
          transition: 'background-color 0.15s ease',
        }}
        onClick={props.onClick}
        onMouseEnter={props.onMouseEnter}
      >
        {props.children}
      </div>
    );
  }
);

const CCMIcon = ({ size }: { size: number }) => {
  return (
    <svg
      viewBox="0 0 29 29"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <path d="M7.5,13h14a5.5,5.5,0,0,0,0-11H7.5a5.5,5.5,0,0,0,0,11Zm0-9h14a3.5,3.5,0,0,1,0,7H7.5a3.5,3.5,0,0,1,0-7Zm0,6A2.5,2.5,0,1,0,5,7.5,2.5,2.5,0,0,0,7.5,10Zm14,6H7.5a5.5,5.5,0,0,0,0,11h14a5.5,5.5,0,0,0,0-11Zm1.43439,8a2.5,2.5,0,1,1,2.5-2.5A2.5,2.5,0,0,1,22.93439,24Z" />
    </svg>
  );
};

interface TopBarProps extends MacActions {
  title: string;
  setSpotlightBtnRef: (value: React.RefObject<HTMLDivElement>) => void;
  hide: boolean;
  toggleSpotlight: () => void;
  openApp?: (id: string) => void;
  toggleNotificationCenter?: () => void;
  showNotificationCenter?: boolean;
  openAboutMac?: () => void;
}

interface TopBarState {
  date: Date;
  showControlCenter: boolean;
  showWifiMenu: boolean;
  showAppleMenu: boolean;
}

const TopBar = (props: TopBarProps) => {
  const appleBtnRef = useRef<HTMLDivElement>(null);
  const controlCenterBtnRef = useRef<HTMLDivElement>(null);
  const wifiBtnRef = useRef<HTMLDivElement>(null);
  const spotlightBtnRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<TopBarState>({
    date: new Date(),
    showControlCenter: false,
    showWifiMenu: false,
    showAppleMenu: false
  });

  const { audio, audioState, controls, audioRef } = useAudioContext();
  const { winWidth, winHeight } = useWindowSize();
  const isMobile = winWidth < 768;

  const { volume, wifi } = useStore((state) => ({
    volume: state.volume,
    wifi: state.wifi
  }));
  const { toggleFullScreen, setVolume, setBrightness } = useStore((state) => ({
    toggleFullScreen: state.toggleFullScreen,
    setVolume: state.setVolume,
    setBrightness: state.setBrightness
  }));

  useInterval(() => {
    setState({
      ...state,
      date: new Date()
    });
  }, 60 * 1000);

  useEffect(() => {
    props.setSpotlightBtnRef(spotlightBtnRef);
    controls.volume(volume / 100);
  }, []);

  const setAudioVolume = (value: number): void => {
    setVolume(value);
    controls.volume(value / 100);
  };

  const setSiteBrightness = (value: number): void => {
    setBrightness(value);
  };

  const toggleControlCenter = (): void => {
    setState({
      ...state,
      showControlCenter: !state.showControlCenter
    });
  };

  const toggleAppleMenu = (): void => {
    setState({
      ...state,
      showAppleMenu: !state.showAppleMenu
    });
  };

  const toggleWifiMenu = (): void => {
    setState({
      ...state,
      showWifiMenu: !state.showWifiMenu
    });
  };

  const logout = (): void => {
    controls.pause();
    props.setLogin(false);
  };

  const shut = (e: React.MouseEvent<HTMLLIElement>): void => {
    controls.pause();
    props.shutMac(e);
  };

  const restart = (e: React.MouseEvent<HTMLLIElement>): void => {
    controls.pause();
    props.restartMac(e);
  };

  const sleep = (e: React.MouseEvent<HTMLLIElement>): void => {
    controls.pause();
    props.sleepMac(e);
  };

  return (
    <div
      className={`w-full h-7 px-2 fixed top-0 hstack justify-between ${
        props.hide ? "z-0" : ""
      } text-sm text-white`}
      style={{
        /* Tahoe: Fully transparent menu bar — no blur, no background */
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        background: 'transparent',
        zIndex: props.hide ? 0 : 99999,
        /* Text readability via subtle drop shadow */
        textShadow: '0 0.5px 2px rgba(0,0,0,0.25)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        opacity: props.hide ? 0 : 1,
        transform: props.hide ? 'translateY(-100%)' : 'translateY(0)',
        fontSize: '13px',
        fontWeight: 400,
        fontFamily: 'var(--font-system)',
      }}
    >
      <div className="hstack space-x-1">
        <TopBarItem
          className="px-2"
          forceHover={state.showAppleMenu}
          onClick={toggleAppleMenu}
          ref={appleBtnRef}
        >
          <svg width="15" height="15" viewBox="0 0 170 170" fill="currentColor" style={{ color: "white" }}>
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.33.13-9.13-1.9-14.4-6.1-3.48-2.82-7.46-7.55-11.95-14.19-6.3-9.17-11.27-19.34-14.92-30.5-3.65-11.16-5.48-21.73-5.48-31.7 0-13.88 3.51-25.26 10.53-34.13 7.02-8.87 15.82-13.37 26.4-13.5 4.83 0 10.01 1.25 15.54 3.75 5.53 2.5 9.4 3.75 11.61 3.75 1.95 0 5.86-1.28 11.73-3.84 5.87-2.56 10.87-3.79 15-3.69 11.22.63 20.31 4.79 27.27 12.48-9.84 5.97-14.63 14.15-14.37 24.53.26 8.35 3.5 15.34 9.72 20.97 6.22 5.63 13.68 8.94 22.38 9.94-2.3 6.78-5.32 13.78-9.06 21.01zm-32.96-104.91c0 6.64-2.37 12.89-7.1 18.75-5.54 6.79-12.56 10.74-21.06 11.85-.26-.88-.39-1.89-.39-3.03 0-6.49 2.53-12.78 7.59-18.87 2.65-3.23 5.92-5.91 9.8-8.04 3.88-2.13 7.64-3.3 11.28-3.5.13.9.19 1.85.19 2.84z"/>
          </svg>
        </TopBarItem>
        <TopBarItem
          className="font-semibold px-2"
          onMouseEnter={() => {
            if (state.showAppleMenu) toggleAppleMenu();
          }}
        >
          {props.title}
        </TopBarItem>
      </div>

      {/* Open this when clicking on Apple logo */}
      {state.showAppleMenu && (
        <AppleMenu
          logout={logout}
          shut={shut}
          restart={restart}
          sleep={sleep}
          toggleAppleMenu={toggleAppleMenu}
          openApp={props.openApp}
          openAboutMac={props.openAboutMac}
          btnRef={appleBtnRef}
        />
      )}

      <div className="hstack flex-row justify-end space-x-1.5">
        <TopBarItem hideOnMobile={true}>
          <Battery />
        </TopBarItem>
        <TopBarItem
          hideOnMobile={true}
          forceHover={state.showWifiMenu}
          onClick={toggleWifiMenu}
          ref={wifiBtnRef}
        >
          {wifi ? (
            <img src="/img/icons/sf-icons/wifi.svg" alt="Wi-Fi" style={{ width: "18px", height: "18px", filter: "invert(1)" }} />
          ) : (
            <img src="/img/icons/sf-icons/wifi.svg" alt="Wi-Fi Off" style={{ width: "18px", height: "18px", filter: "invert(1)", opacity: 0.5 }} />
          )}
        </TopBarItem>
        <TopBarItem ref={spotlightBtnRef} onClick={props.toggleSpotlight}>
          <img src="/img/icons/sf-icons/search.svg" alt="Spotlight Search" style={{ width: "17px", height: "17px", filter: "invert(1)" }} />
        </TopBarItem>
        <TopBarItem
          forceHover={state.showControlCenter}
          onClick={toggleControlCenter}
          ref={controlCenterBtnRef}
        >
          <CCMIcon size={16} />
        </TopBarItem>

        {/* Open this when clicking on Wifi button */}
        {state.showWifiMenu && (
          <WifiMenu toggleWifiMenu={toggleWifiMenu} btnRef={wifiBtnRef} />
        )}

        {/* Open this when clicking on Control Center button */}
        <AnimatePresence>
          {state.showControlCenter && (
            <ControlCenterMenu
              playing={audioState.playing}
              toggleAudio={controls.toggle}
              setVolume={setAudioVolume}
              setBrightness={setSiteBrightness}
              toggleControlCenter={toggleControlCenter}
              btnRef={controlCenterBtnRef}
            />
          )}
        </AnimatePresence>

        <TopBarItem
          forceHover={props.showNotificationCenter}
          onClick={props.toggleNotificationCenter}
        >
          <span className="font-tabular">{format(state.date, "eee MMM d")}</span>
          <span className="font-tabular">{format(state.date, "h:mm aa")}</span>
        </TopBarItem>
      </div>

      {/* Invisible Swipe Zones for Mobile Gestures */}
      {isMobile && (
        <>
          <div
            className="fixed top-0 left-0 w-1/2 h-12 z-[99998]"
            onTouchStart={(e) => {
              const touch = e.touches[0];
              (e.target as any).startY = touch.clientY;
            }}
            onTouchMove={(e) => {
              const touch = e.touches[0];
              const startY = (e.target as any).startY;
              if (startY !== undefined && touch.clientY - startY > 30) {
                if (!props.showNotificationCenter) {
                  props.toggleNotificationCenter?.();
                }
                (e.target as any).startY = undefined;
              }
            }}
            onClick={props.toggleNotificationCenter}
          />
          <div
            className="fixed top-0 right-0 w-1/2 h-12 z-[99998]"
            onTouchStart={(e) => {
              const touch = e.touches[0];
              (e.target as any).startY = touch.clientY;
            }}
            onTouchMove={(e) => {
              const touch = e.touches[0];
              const startY = (e.target as any).startY;
              if (startY !== undefined && touch.clientY - startY > 30) {
                if (!state.showControlCenter) {
                  toggleControlCenter();
                }
                (e.target as any).startY = undefined;
              }
            }}
            onClick={toggleControlCenter}
          />
        </>
      )}
    </div>
  );
};

export default TopBar;
