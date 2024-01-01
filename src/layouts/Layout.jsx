import React, {
  Fragment,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { Disclosure } from "@headlessui/react";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faBan,
  faUserCheck,
} from "@fortawesome/free-solid-svg-icons";
import profilePicture from "../assets/img/profilePicture.png";
import RegLogo from "../assets/img/flag.svg";
import { getProfilePicture } from "../api/user-apis/UserApis";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  ChevronDownIcon,
  // MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
// import Dashboard from "../pages/home/Dashboard";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidenavbarlogo from "../assets/img/IRI Logo 2.svg";
import Avatar from "react-avatar";
import { doUserLogout } from "../api/api-handlers/ApiHandler";
import {
  faHouse,
  faUsers,
  faFolderClosed,
  faBook,
  faShip,
  faCalendarDays,
  faMagnifyingGlass,
  faCertificate,
  faRectangleList,
  faUserTie,
  faClipboardList,
  faFilePen,
  faReceipt,
  faList,
  faListCheck,
} from "@fortawesome/free-solid-svg-icons";
import {
  getLogoutStatus,
  getUserData,
  isEmptyArray,
  isEmptyObject,
  isEmptyString,
  updateLogoutStatus,
} from "../utils/AppUtils";
import { getUserScreenList, getUserThemeData } from "../api/user-apis/UserApis";
import {
  WhiteListedUrls,
  internalUser,
  onlyDPRole,
  sessionMaxTimeout,
  sessionWarningTimeout,
} from "../AppConstants";
import YourProfile from "../components/common/yourProfile";
import SessionTimeoutModal from "../components/common/SessionTimeoutModal";
import SessionExpiredModal from "../components/common/SessionExpiredModal";

const teams = [
  // { id: 1, name: "Heroicons", href: "#", initial: "H", current: false },
  // { id: 2, name: "Tailwind Labs", href: "#", initial: "T", current: false },
  // { id: 3, name: "Workcation", href: "#", initial: "W", current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getMenuItemPositionDetails() {
  const storedData = sessionStorage.getItem("SideBar_Value");
  const parsedData = JSON.parse(
    storedData === undefined || storedData === null
      ? `{"index":0, "childIndex": -1}`
      : storedData
  );
  return parsedData;
}

function createNavItems(screens = []) {
  if (!Array.isArray(screens) || isEmptyArray(screens)) return [];
  let navItems = [];
  let level = 0;
  let multiLevel = {};
  let navItemPosition = 0;

  const iconMapping = {
    1: faHouse,
    2: faList,
    3: faUsers,
    4: faShip,
    5: faFilePen,
    6: faClipboardList,
    7: faMagnifyingGlass,
    8: faCertificate,
    9: faClipboardList,
    10: faFilePen,
    11: faListCheck,
    12: faCalendarDays,
    13: faUsers,
    14: faUsers,
    15: faFolderClosed,
    16: faUserTie,
    17: faReceipt,
    18: faBan,
    19: faUserCheck,
  };
  for (let i = 0; i < screens.length; i++) {
    const screen = screens[i];
    if (!screen.screen_desc) {
      level = 0;
      navItems.push({
        name: screen.screen_name,
        href: screen.screen_path,
        icon: iconMapping[screen.screen_id] || null,
        screenId: screen.screen_id,
        id: i + 1,
        level: level,
        current: false,
      });
      continue;
    }
    level = 1;
    if (!multiLevel[`${screen.screen_desc}`]) {
      multiLevel[`${screen.screen_desc}`] = {
        name: screen.screen_desc,
        pos: navItems.length,
      };

      navItems.push({
        name: screen.screen_desc,
        href: "#",
        icon: iconMapping[screen.screen_id] || null,
        id: screen.screen_id,
        level: level,
        children: [
          {
            name: screen.screen_name,
            href: screen.screen_path,
            icon: iconMapping[screen.screen_id] || null,
            screenId: screen.screen_id,
            id: i + 1,
            level: level,
            current: false,
          },
        ],
      });
      navItemPosition = navItems.length - 1;
      continue;
    }

    navItems[multiLevel[`${screen.screen_desc}`].pos].children.push({
      name: screen.screen_name,
      href: screen.screen_path,
      icon: iconMapping[screen.screen_id] || null,
      screenId: screen.screen_id,
      id: i + 1,
      level: level,
      current: false,
    });
  }

  const parsedData = getMenuItemPositionDetails();
  const index = parsedData.index;
  const childIndex = parsedData.childIndex;

  navItems[index].current = true;

  if (/^\d+$/.test(`${childIndex}`)) {
    navItems[index].children[childIndex].current = true;
  }

  return navItems;
}

function getAuthorizedUrls(screens = []) {
  if (isEmptyArray(screens)) return null;
  const internalWhiteListedUrls = screens
    .filter(({ screen_id }) => !!WhiteListedUrls[screen_id])
    .map(({ screen_id }) => WhiteListedUrls[screen_id].join("|"))
    .join("|");
  const coreWhiteListedUrls = screens
    .map(({ screen_path }) => screen_path)
    .join("|");
  return `${
    isEmptyString(coreWhiteListedUrls) ? `` : `${coreWhiteListedUrls}|`
  }${internalWhiteListedUrls}`;
}
export function getMenuItemPosition(menuItemScreenId, navItems = []) {
  if (!/^\d+$/.test(`${menuItemScreenId}`) || isEmptyArray(navItems))
    return [-1, -1];
  for (let i = 0; i < navItems.length; i++) {
    if (!navItems[i].children && navItems[i].screenId === menuItemScreenId) {
      return [i, -1];
    }
    for (let j = 0; j < navItems[i].children?.length; j++) {
      const navItem = navItems[i].children[j];
      if (navItem.screenId === menuItemScreenId) return [i, j];
    }
  }
  return [-1, -1];
}

export function Layout() {
  const [openmodal, setOpenmodal] = useState(false);
  const openProfileModal = () => {
    setOpenmodal(true);
  };

  const [authorizedUrls, setAuthorizedUrls] = useState(null);
  const currentURL = useLocation().pathname;
  const navigateTo = useNavigate();

  const closeModal = () => {
    setProfilePic(initialPicture);
    setOpenmodal(false);
    isEmptyObject(cancelSavedTheame)
      ? setSelectedThemeColors({
          name: "Default Combination",
          sideBarColor: "bg-gray-900",
          textColor: "text-gray-400",
        })
      : setSelectedThemeColors(cancelSavedTheame);
  };

  /** Session time out code start */
  const timeToExpire = sessionStorage.getItem("newFormattedTime") - Date.now();

  const [showSessionTimeoutModal, setShowSessionTimeoutModal] = useState(false);
  const [showSessionExpiryModal, setShowSessionExpiryModal] = useState(
    timeToExpire <= 0
  );
  const [initialTime, setInitialTime] = useState(sessionMaxTimeout);
  const [warningTime, setWarningTime] = useState(sessionWarningTimeout);
  const timeoutIdRef = useRef(null);

  useEffect(() => {
    if (timeToExpire < 0) return;
    const timer = setTimeout(() => {
      setShowSessionExpiryModal(true);
    }, timeToExpire);
    return () => clearTimeout(timer);
  }, []);

  const resetTimeout = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    const newTimeoutId = setTimeout(() => {
      setShowSessionTimeoutModal(true);
    }, initialTime - warningTime);

    timeoutIdRef.current = newTimeoutId;
  }, []);

  const handleUserActivity = useCallback(() => {
    resetTimeout();
  }, [resetTimeout]);

  useEffect(() => {
    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    resetTimeout();
    return () => {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      clearTimeout(timeoutIdRef.current);
    };
  }, [handleUserActivity, resetTimeout]);

  const signoutHandle = () => {
    setShowSessionTimeoutModal(false);
    navigateTo("/auth/log-in");
    doUserLogout()
      .then((data) => {
        sessionStorage.setItem("loggedOut", data.loggedOut);
      })
      .catch((error) => {
        console.error(error);
        throw new Error(error);
      })
      .finally(() => {
        updateLogoutStatus({ status: true });
      });
  };

  const closeSessionModal = () => {
    setShowSessionTimeoutModal(false);
    resetTimeout();
  };
  const closeSessionExpiryModal = () => {
    // setShowSessionExpiryModal(false);
  };

  /** Session time out code end  */

  const userNavigation = [
    { name: "Profile Details", href: "#", onClick: openProfileModal },
    { name: "Sign Out", href: "/auth/log-in", onClick: signoutHandle },
  ];
  const [themeColors, setThemeColors] = useState([
    {
      name: "Default Combination",
      sideBarColor: "bg-gray-900",
      textColor: "text-gray-400",
    },
    {
      name: "Dark Combination",
      sideBarColor: "bg-[#002b45]",
      textColor: "text-gray-400",
    },
    {
      name: "Blue Combination",
      sideBarColor: "bg-[#005298]",
      textColor: "text-[#e6e6e6]",
    },
    {
      name: "Orange Combination",
      sideBarColor: "bg-[#f7941d]",
      textColor: "text-white",
    },
    {
      name: "Light Blue Combination",
      sideBarColor: "bg-[#3985c6]",
      textColor: "text-[#e6e6e6]",
    },
  ]);
  const [selectedThemeColors, setSelectedThemeColors] = useState({
    name: "Default Combination",
    sideBarColor: "bg-gray-900",
    textColor: "text-gray-400",
  });
  const [cancelSavedTheame, setCancelSavedTheame] = useState({});
  const [pageTitle, setPageTitle] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarOpenDesk, setSidebarOpenDesk] = useState(true);
  const [showHideItemName, setShowHideItemName] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [sideBarHandler, setSideBarHandler] = useState(false);
  const menuItemPosition = getMenuItemPositionDetails();
  const [selected, setSelected] = useState({
    pos: menuItemPosition?.index || -1,
    open: menuItemPosition?.childIndex > -1 || false,
  });

  const userArray = JSON.parse(getUserData());

  const [profilePic, setProfilePic] = useState(null);
  const [initialPicture, setInitialPicture] = useState(null);
  const { userId, uuid, roles } = JSON.parse(getUserData());
  const isFirstRoleInternal =
    userArray?.userType === internalUser ? true : false;
  const username = userArray?.userId.split("@")[0];
  const usernameid = username.replace(/\./g, " ");
  const userRoleId =
    userArray?.assignedVesselTypes?.has_yacht === true &&
    userArray?.assignedVesselTypes?.has_bluewater === false
      ? onlyDPRole
      : userArray?.roles[0];

  const authorizedAccess = React.useMemo(() => {
    return (
      isEmptyString(authorizedUrls) ||
      new RegExp(authorizedUrls, "i").test(currentURL)
    );
  }, [authorizedUrls]);

  useEffect(() => {
    if (!authorizedAccess) {
      const [homeUrl] = authorizedUrls.split("|");
      return navigateTo("/unauthorized", { state: { homeUrl } });
    }
  }, [authorizedUrls]);

  /** Function to map side navbar based on selection start */
  const sideBarHandleClick = (index, childIndex = -1) => {
    if (isEmptyArray(menuItems)) return;
    let items = [...menuItems].map((item) => {
      if (!item?.children) return { ...item, current: false };
      item = { ...item, current: false };
      item.children = item?.children.map((child) => ({
        ...child,
        current: false,
      }));
      return item;
    });
    items[index].current = true;
    if (childIndex > -1) {
      items[index].children[childIndex].current = true;
    }
    setSelected((prev) => ({
      open: prev.pos === index && childIndex === -1 ? !prev.open : true,
      pos: index,
    }));
    let data = JSON.stringify({ index, childIndex });
    sessionStorage.setItem("SideBar_Value", data);

    return setMenuItems(items);
  };

  React.useEffect(() => {
    const profileDataLoad = async () => {
      await getProfilePicture()
        .then((data) => {
          setProfilePic(data);
          setInitialPicture(data);
        })
        .catch((error) => {
          console.error("error: ", error);
          throw new Error(error);
          return [];
        });
    };
    profileDataLoad();
    return () => {};
  }, []);

  /** Function to map side navbar based on selection end */

  const setTitle = (title = "") => {
    setPageTitle(title);
  };

  /** Related to navigation side menu button highlight start */
  const setMenuItem = React.useCallback(
    (menuItemScreenId) => {
      const [parentIndex, childIndex] = getMenuItemPosition(
        menuItemScreenId,
        menuItems
      );
      if (parentIndex < 0) return;
      sideBarHandleClick(parentIndex, childIndex);
    },
    [menuItems]
  );
  /** Related to navigation side menu button highlight end */

  useEffect(() => {
    const loadData = async () => {
      await getUserScreenList()
        .then((screens) => {
          const navItemList = createNavItems(screens);
          setMenuItems(navItemList);
          setAuthorizedUrls(getAuthorizedUrls(screens));
        })
        .catch((error) => {});
    };

    const { loggedOut } = getLogoutStatus();
    if (loggedOut) {
      //show the modal
    }
    loadData();
  }, []);

  useEffect(() => {
    const loadThemeData = async () => {
      await getUserThemeData({ userEmailId: userId, userId: uuid })
        .then((data) => {
          setCancelSavedTheame(data?.theme);
          isEmptyObject(data) || isEmptyObject(data?.theme)
            ? setSelectedThemeColors({
                name: "Default Combination",
                sideBarColor: "bg-gray-900",
                textColor: "text-gray-400",
              })
            : setSelectedThemeColors(data?.theme);
        })
        .catch((error) => {});
    };
    loadThemeData();
  }, []);

  const handleThemeSelection = (selectedTheme) => {
    setSelectedThemeColors(selectedTheme);
  };
  const handleSelectedPic = (profile) => {
    setProfilePic(profile);
  };
  const checkSideBarHandler = () => {
    if (sideBarHandler === true) {
      setSideBarHandler(false);
    } else {
      setSideBarHandler(true);
    }
    setSidebarOpenDesk(!sidebarOpenDesk);
  };

  const sideBarEnterHandler = () => {
    if (sideBarHandler === true) {
      if (sidebarOpenDesk === false) {
        setSidebarOpenDesk(true);
      } else {
        setSidebarOpenDesk(false);
      }
    }
  };

  const sideBarLeaveHandler = () => {
    if (sideBarHandler === true) {
      setSidebarOpenDesk(false);
    }
  };

  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html className="h-full bg-white">
        <body className="h-full">
        ```
      */}
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50 lg:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button
                        type="button"
                        className="-m-2.5 p-2.5"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  {/* Sidebar component, swap this element with another sidebar if you like */}

                  <div className="flex grow flex-col gap-y-5 hide-scrollbar overflow-y-auto bg-gray-900 px-6 pb-4 ring-1 ring-white/10">
                    <div className="flex h-24 shrink-0 items-center">
                      <img
                        className="h-12 w-60"
                        src={Sidenavbarlogo}
                        alt="International Registries, Inc."
                      />
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul
                        // role="list"
                        className="flex flex-1 flex-col gap-y-7"
                      >
                        <li>
                          <ul
                            // role="list"
                            className="-mx-2 space-y-1"
                          >
                            {menuItems.map((item, parentId) => (
                              <li key={item.name}>
                                {!item.children ? (
                                  <Link
                                    to={item.href}
                                    onClick={() => sideBarHandleClick(parentId)}
                                    className={classNames(
                                      item.current
                                        ? "bg-gray-800 text-white"
                                        : "text-gray-400 hover:text-white hover:bg-gray-800",
                                      "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                    )}
                                  >
                                    <FontAwesomeIcon
                                      icon={item.icon}
                                      className={`h-6 w-6 shrink-0 ${selectedThemeColors?.textColor}`}
                                    />

                                    {item.name}
                                  </Link>
                                ) : (
                                  <Disclosure
                                    as="div"
                                    onClick={() => sideBarHandleClick(parentId)}
                                  >
                                    <Disclosure.Button
                                      className={classNames(
                                        item.current
                                          ? "bg-gray-800 text-white"
                                          : "text-gray-400 hover:text-white hover:bg-gray-800",
                                        "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold w-full"
                                      )}
                                    >
                                      <FontAwesomeIcon
                                        icon={item.icon}
                                        className={`h-6 w-6 shrink-0 ${selectedThemeColors?.textColor}`}
                                      />

                                      {item.name}
                                      <ChevronRightIcon
                                        className={classNames(
                                          selected.pos === parentId &&
                                            selected.open
                                            ? "rotate-90 text-gray-500"
                                            : "text-gray-400",
                                          "ml-auto h-5 w-5 shrink-0"
                                        )}
                                        aria-hidden="true"
                                      />
                                    </Disclosure.Button>
                                    {selected.pos === parentId &&
                                      selected.open && (
                                        <ul className="mt-1 px-2">
                                          {item.children.map(
                                            (subItem, childId) => (
                                              <li key={subItem.name}>
                                                {/* 44px */}
                                                <Disclosure.Button
                                                  as="a"
                                                  href={subItem.href}
                                                  onClick={() =>
                                                    sideBarHandleClick(
                                                      parentId,
                                                      childId
                                                    )
                                                  }
                                                  className={classNames(
                                                    subItem.current
                                                      ? "bg-gray-800 text-white"
                                                      : "text-gray-400 hover:text-white hover:bg-gray-800",
                                                    "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                                  )}
                                                >
                                                  <FontAwesomeIcon
                                                    icon={subItem.icon}
                                                    className={`h-6 w-6 shrink-0 ${selectedThemeColors?.textColor}`}
                                                  />
                                                  {subItem.name}
                                                </Disclosure.Button>
                                              </li>
                                            )
                                          )}
                                        </ul>
                                      )}
                                  </Disclosure>
                                )}
                              </li>
                            ))}
                          </ul>
                        </li>
                        <li>
                          {/* <div className="text-xs font-semibold leading-6 text-gray-400">
                            Your teams
                          </div> */}
                          <ul
                            // role="list"
                            className="-mx-2 mt-2 space-y-1"
                          >
                            {teams.map((team) => (
                              <li key={team.name}>
                                <a
                                  href={team.href}
                                  className={classNames(
                                    team.current
                                      ? "bg-gray-800 text-white"
                                      : "text-gray-400 hover:text-white hover:bg-gray-800",
                                    "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                  )}
                                >
                                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">
                                    {team.initial}
                                  </span>
                                  <span className="truncate">{team.name}</span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </li>
                        {/* <li className="mt-auto">
                          <a
                            href="#"
                            className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-800 hover:text-white"
                          >
                            <Cog6ToothIcon
                              className="h-6 w-6 shrink-0"
                              aria-hidden="true"
                            />
                            Settings
                          </a>
                        </li> */}
                        <li className="mt-auto">
                          <div className="group -mx-2 flex gap-x-3 rounded-md p-2 text-xs font-bold leading-6 text-gray-100 ">
                            Last Refresh: {userArray?.lastRefreshDateTime}
                          </div>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        {
          <div
            className={`${
              sidebarOpenDesk
                ? "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col"
                : "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-18 lg:flex-col"
            }`}
            onMouseEnter={sideBarEnterHandler}
            onMouseLeave={sideBarLeaveHandler}
          >
            {/* Sidebar component, swap this element with another sidebar if you like */}
            <div
              className={`flex grow flex-col gap-y-5 hide-scrollbar overflow-y-auto  ${
                sidebarOpenDesk ? "px-6 pb-4" : "px-0 pb-4"
              } ${selectedThemeColors?.sideBarColor}`}
            >
              <div className="flex h-24 shrink-0 items-center text-white">
                <img
                  className={`${sidebarOpenDesk ? "h-12 w-60" : "h-12 w-20"}`}
                  src={sidebarOpenDesk ? Sidenavbarlogo : RegLogo}
                  alt="International Registries, Inc."
                />
              </div>
              <nav className="flex flex-1 flex-col">
                <ul
                  // role="list"
                  className="flex flex-1 flex-col gap-y-7"
                >
                  <li>
                    <ul
                      // role="list"
                      className="-mx-2 space-y-1"
                    >
                      {menuItems.map((item, parentId) => (
                        <li key={item.name}>
                          {!item.children ? (
                            <Link
                              to={item.href}
                              onClick={() => sideBarHandleClick(parentId)}
                              className={classNames(
                                item.current
                                  ? "bg-gray-800 text-white"
                                  : `${selectedThemeColors?.textColor} hover:text-white hover:bg-gray-800`,
                                "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                              )}
                            >
                              <FontAwesomeIcon
                                icon={item.icon}
                                className={`h-6 w-6 shrink-0 ${
                                  sidebarOpenDesk ? "" : "ml-4"
                                } ${selectedThemeColors?.textColor}`}
                              />
                              {/* <item.icon
                                className={`h-6 w-6 shrink-0 ${selectedThemeColors?.textColor}`}
                                aria-hidden="true"
                              /> */}
                              {sidebarOpenDesk && item.name}
                            </Link>
                          ) : (
                            <Disclosure
                              as="div"
                              onClick={() => sideBarHandleClick(parentId)}
                            >
                              <Disclosure.Button
                                className={classNames(
                                  item.current
                                    ? "bg-gray-800 text-white"
                                    : `${selectedThemeColors?.textColor} hover:text-white hover:bg-gray-800`,
                                  "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold w-full"
                                )}
                              >
                                <FontAwesomeIcon
                                  icon={item.icon}
                                  className={`h-6 w-6 shrink-0 ${
                                    sidebarOpenDesk ? "" : "ml-4"
                                  } ${selectedThemeColors?.textColor}`}
                                />

                                {sidebarOpenDesk && item.name}

                                <ChevronRightIcon
                                  className={classNames(
                                    parentId === selected.pos && selected.open
                                      ? `rotate-90 ${selectedThemeColors?.textColor}`
                                      : `${selectedThemeColors?.textColor}`,
                                    "ml-auto h-5 w-5 shrink-0"
                                  )}
                                  aria-hidden="true"
                                />
                              </Disclosure.Button>
                              {selected.pos === parentId && selected.open && (
                                <ul className="mt-1 px-2">
                                  {item.children.map((subItem, childId) => (
                                    <li key={subItem.name}>
                                      {/* 44px */}
                                      {/* <Disclosure.Button
                                    as="a"
                                    href={subItem.href}
                                    className={classNames(
                                      subItem.current
                                        ? "bg-gray-800 text-white"
                                        : "text-gray-400 hover:text-white hover:bg-gray-800",
                                      "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                    )}
                                  >
                                    {subItem.name}
                                  </Disclosure.Button> */}
                                      <Link
                                        to={subItem.href}
                                        onClick={() =>
                                          sideBarHandleClick(parentId, childId)
                                        }
                                        className={classNames(
                                          subItem.current
                                            ? "bg-gray-800 text-white"
                                            : `${selectedThemeColors?.textColor} hover:text-white hover:bg-gray-800`,
                                          "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                        )}
                                      >
                                        <FontAwesomeIcon
                                          icon={subItem.icon}
                                          className={`h-5 w-5 shrink-0 ${
                                            sidebarOpenDesk ? "" : "ml-4"
                                          } ${selectedThemeColors?.textColor}`}
                                        />
                                        {sidebarOpenDesk && subItem.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </Disclosure>
                          )}
                        </li>
                      ))}
                    </ul>
                  </li>
                  <li>
                    {/* <div className="text-xs font-semibold leading-6 text-gray-400">
                Your teams
              </div> */}
                    <ul
                      // role="list"
                      className="-mx-2 mt-2 space-y-1"
                    >
                      {teams.map((team) => (
                        <li key={team.name}>
                          <a
                            href={team.href}
                            className={classNames(
                              team.current
                                ? "bg-gray-800 text-white"
                                : "text-gray-400 hover:text-white hover:bg-gray-800",
                              "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                            )}
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">
                              {team.initial}
                            </span>
                            <span className="truncate">{team.name}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                  {/* <li className="mt-auto">
              <a
                href="#"
                className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                <Cog6ToothIcon
                  className="h-6 w-6 shrink-0"
                  aria-hidden="true"
                />
                Settings
              </a>
            </li> */}

                  <li className="mt-auto">
                    {sidebarOpenDesk && (
                      <div className="group -mx-2 flex gap-x-3 rounded-md p-2 text-xs font-bold leading-6 text-gray-100">
                        Last Refresh: {userArray?.lastRefreshDateTime}
                      </div>
                    )}
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        }

        <div
          className={`${
            (sidebarOpenDesk === false || sidebarOpenDesk === true) &&
            sideBarHandler === true
              ? "lg:pl-20"
              : "lg:pl-72"
          }`}
        >
          <div
            className={`sticky top-0 z-40 bg-white flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200  px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 `}
          >
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden sm:block"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 hidden lg:block "
              onClick={checkSideBarHandler}
            >
              <span className="sr-only">Open sidebar</span>
              {sidebarOpenDesk ? (
                <ChevronDoubleLeftIcon className="h-8 w-8" aria-hidden="true" />
              ) : (
                <ChevronDoubleRightIcon
                  className="h-8 w-8"
                  aria-hidden="true"
                />
              )}
            </button>

            {/* Separator */}
            <div className="h-6 w-px bg-gray-900/10 " aria-hidden="true" />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end">
              <form className="relative flex flex-1 " action="#" method="GET">
                {(pageTitle === "COMPANY INFORMATION" && isFirstRoleInternal) ||
                pageTitle === "Declined List" ||
                pageTitle === "Create User" ||
                pageTitle === "Update User" ||
                pageTitle === "History Inspection Details" ||
                pageTitle === "History Audit Details" ? (
                  <div className="flex justify-center items-center font-semibold text-l sm:text-xl mr-4">
                    <div className="relative flex items-center group">
                      <div className="flex justify-center items-center mt-1 w-full cursor-pointer gap-1 ">
                        {" "}
                        {pageTitle === "COMPANY INFORMATION" &&
                          isFirstRoleInternal && (
                            <Link to="/companylist">
                              <FontAwesomeIcon
                                icon={faArrowLeft}
                                className="h-6 w-6 text-gray-700  cursor-pointer"
                              />
                            </Link>
                          )}
                        {pageTitle === "Declined List" && (
                          <Link to="/scheduling/pendingapproval">
                            <FontAwesomeIcon
                              icon={faArrowLeft}
                              className="h-6 w-6 text-gray-700  cursor-pointer"
                            />
                          </Link>
                        )}
                        {pageTitle === "Create User" && isFirstRoleInternal && (
                          <Link to="/maintenance/internaluserlist">
                            <FontAwesomeIcon
                              icon={faArrowLeft}
                              className="h-6 w-6 text-gray-700  cursor-pointer"
                            />
                          </Link>
                        )}
                        {pageTitle === "Create User" &&
                          !isFirstRoleInternal && (
                            <Link to="/maintenance/userlist">
                              <FontAwesomeIcon
                                icon={faArrowLeft}
                                className="h-6 w-6 text-gray-700  cursor-pointer"
                              />
                            </Link>
                          )}
                        {pageTitle === "Update User" && isFirstRoleInternal && (
                          <Link to="/maintenance/internaluserlist">
                            <FontAwesomeIcon
                              icon={faArrowLeft}
                              className="h-6 w-6 text-gray-700  cursor-pointer"
                            />
                          </Link>
                        )}
                        {pageTitle === "Update User" &&
                          !isFirstRoleInternal && (
                            <Link to="/maintenance/userlist">
                              <FontAwesomeIcon
                                icon={faArrowLeft}
                                className="h-6 w-6 text-gray-700  cursor-pointer"
                              />
                            </Link>
                          )}
                        {pageTitle === "History Inspection Details" && (
                          <Link to="/fleetoverview/inspection">
                            <FontAwesomeIcon
                              icon={faArrowLeft}
                              className="h-6 w-6 text-gray-700  cursor-pointer"
                            />
                          </Link>
                        )}
                        {pageTitle === "History Audit Details" && (
                          <Link to="/fleetoverview/audit">
                            <FontAwesomeIcon
                              icon={faArrowLeft}
                              className="h-6 w-6 text-gray-700  cursor-pointer"
                            />
                          </Link>
                        )}
                      </div>
                      <div className="absolute top-0 flex flex-col items-center hidden mt-10 group-hover:flex">
                        <span className="relative z-10 p-2 text-sm font-normal font-sans leading-normal text-black rounded-md whitespace-nowrap bg-[#f1f5f9] shadow-[0_1px_4px_-1px_rgba(125,125,125)]">
                          {pageTitle === "COMPANY INFORMATION"
                            ? "Go back to Company List"
                            : pageTitle === "Declined List"
                            ? "Go back to List of Requests"
                            : pageTitle === "History Inspection Details"
                            ? "Go back to Upcoming Inspection Details"
                            : pageTitle === "History Audit Details"
                            ? "Go back to Upcoming Audit Details"
                            : "Go back to User List"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  ""
                )}{" "}
                <div
                  className={`flex justify-center items-center font-semibold text-l sm:text-xl ${
                    pageTitle === "ACTIVE DPAs / DPs" ||
                    pageTitle === "BLOCKED IPs"
                      ? ""
                      : "uppercase"
                  }`}
                >
                  {pageTitle ? pageTitle : ""}
                </div>
                {/* <MagnifyingGlassIcon
                  className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  id="search-field"
                  className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                  placeholder="Search..."
                  type="search"
                  name="search"
                /> */}
              </form>
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                {/* <button
                  type="button"
                  className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button> */}

                {/* Separator */}
                <div
                  className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10"
                  aria-hidden="true"
                />

                {/* Profile dropdown */}
                <Menu as="div" className="relative">
                  <Menu.Button className="-m-1.5 flex items-center p-1.5">
                    <span className="sr-only">Open user menu</span>
                    {/* <Avatar
                      name={localStorage.getItem("userId")}
                      size={40}
                      round="35rem"
                    /> */}
                    <img
                      src={profilePic ? profilePic : profilePicture}
                      className="rounded-full w-10 h-10"
                      alt="profile picture"
                    />
                    <span className="hidden lg:flex lg:items-center">
                      <span
                        className="ml-4 text-sm font-semibold leading-6 text-gray-900 uppercase"
                        aria-hidden="true"
                      >
                        {userArray?.userFullName}
                      </span>
                      <ChevronDownIcon
                        className="ml-2 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                      {userNavigation.map((item) => (
                        <Menu.Item key={item.name}>
                          {({ active }) => (
                            <Link
                              to={item.href}
                              onClick={() => {
                                const clickFunction =
                                  typeof item?.onClick === "function"
                                    ? item.onClick
                                    : () => {};
                                clickFunction();
                              }}
                              className={classNames(
                                active ? "bg-gray-50" : "",
                                "block px-3 py-1 text-sm leading-6 text-gray-900"
                              )}
                            >
                              {item.name}
                            </Link>
                          )}
                        </Menu.Item>
                      ))}
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

          <main className={`py-2 px-1 ${selectedThemeColors?.contentColor}`}>
            <Outlet context={{ setTitle, setMenuItem, selected }} />
          </main>
        </div>
      </div>
      {openmodal && (
        <YourProfile
          onClose={closeModal}
          usernameid={usernameid}
          userRoleId={userRoleId}
          themeColors={themeColors}
          setOpenmodal={setOpenmodal}
          selectedColor={selectedThemeColors}
          profilePic={profilePic}
          setProfilePic={setProfilePic}
          pic={handleSelectedPic}
          onSelectTheme={handleThemeSelection}
          resetInitialPicture={setInitialPicture}
        />
      )}

      {/* Render the SessionTimeoutModal modal */}
      {!showSessionExpiryModal && showSessionTimeoutModal && (
        <SessionTimeoutModal
          onClose={closeSessionModal}
          resetTimeout={resetTimeout}
          onClick={signoutHandle}
          initialTime={initialTime}
        />
      )}
      {showSessionExpiryModal && (
        <SessionExpiredModal
          onClick={signoutHandle}
          onClose={closeSessionExpiryModal}
        />
      )}
    </>
  );
}
export default Layout;
