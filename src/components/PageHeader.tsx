import React from "react";
import { Link } from "react-router-dom";

interface Breadcrumb {
  name: string;
  href: string;
}

interface PageHeaderProps {
  breadcrumbs: Breadcrumb[];
  title: string;
  meta?: React.ReactNode[];
  actions?: React.ReactNode;
}

const ChevronRightIcon = () => (
  <svg
    className="h-5 w-5 flex-shrink-0"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
      clipRule="evenodd"
    />
  </svg>
);
const HomeIcon = () => (
  <svg
    className="h-5 w-5 flex-shrink-0"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);

const PageHeader: React.FC<PageHeaderProps> = ({
  breadcrumbs,
  title,
  meta,
  actions,
}) => {
  return (
    // <div className="mb-8">
    //   <div className="text-sm breadcrumbs">
    //     <ul>
    //       <li>
    //         <Link to="/">
    //           <HomeIcon /> หน้าหลัก
    //         </Link>
    //       </li>
    //       {breadcrumbs.map((crumb) => (
    //         <li key={crumb.name}>
    //           <Link to={crumb.href}>{crumb.name}</Link>
    //         </li>
    //       ))}
    //     </ul>
    //   </div>
    <div className="mb-8">
      <div className="mt-2 md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-base-content sm:truncate sm:text-3xl">
            {title}
          </h2>
          {meta && meta.length > 0 && (
            <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
              {meta.map((item, index) => (
                <div
                  key={index}
                  className="mt-2 flex items-center text-sm text-base-content/70"
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
        {actions && (
          <div className="mt-4 flex flex-shrink-0 md:mt-0 md:ml-4">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
