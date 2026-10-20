type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const baseButtonClasses =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-solid px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50";

const idleButtonClasses =
  "border-primary/30 bg-surface text-foreground hover:border-primary";

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  // Everything fits in one page: no controls
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav
      aria-label="Paginación"
      className="mt-6 flex flex-wrap items-center justify-center gap-2"
    >
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className={`${baseButtonClasses} ${idleButtonClasses}`}
      >
        Anterior
      </button>

      <ul className="m-0 flex list-none flex-wrap justify-center gap-2 p-0">
        {pages.map((page) => {
          const isCurrent = page === currentPage;

          return (
            <li key={page}>
              <button
                type="button"
                aria-label={`Página ${page}`}
                aria-current={isCurrent ? "page" : undefined}
                onClick={() => onPageChange(page)}
                className={`${baseButtonClasses} ${
                  isCurrent
                    ? "border-primary bg-primary text-white"
                    : idleButtonClasses
                }`}
              >
                {page}
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className={`${baseButtonClasses} ${idleButtonClasses}`}
      >
        Siguiente
      </button>
    </nav>
  );
}
