import { useEffect, useRef } from "react";
import { RecommendationsSection } from "./RecommendationsSection";

type RecommendationsDialogProps = {
  open: boolean;
  personId: number;
  personName: string;
  savedIdeasVersion: number;
  onSavedIdeasChanged: () => void;
  onClose: () => void;
};

export function RecommendationsDialog({
  open,
  personId,
  personName,
  savedIdeasVersion,
  onSavedIdeasChanged,
  onClose,
}: RecommendationsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function closeDialog() {
    dialogRef.current?.close();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="recommendations-dialog-title"
      className="relative m-auto min-h-[min(42rem,90dvh)] max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-3xl border border-accent-lavender/50 bg-accent-lavender/10 bg-cover bg-right p-0 text-foreground shadow-2xl shadow-primary/20 backdrop:bg-primary/50 backdrop:backdrop-blur-sm sm:bg-center"
      style={{ backgroundImage: "url('/recommendations-modal-bg.png')" }}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeDialog();
      }}
    >
      <div className="relative p-5 sm:p-8">
        <header className="mb-5 max-w-[78%] pt-5 sm:max-w-[72%] sm:pt-7">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent-gold/30 bg-white/75 px-3 py-1 text-xs font-semibold tracking-wide text-primary shadow-sm backdrop-blur-sm">
              <span aria-hidden="true" className="text-accent-gold">✦</span>
              Recomendaciones personalizadas
            </p>
            <h2
              id="recommendations-dialog-title"
              className="m-0 font-serif text-2xl font-bold leading-tight text-primary sm:text-3xl"
            >
              Recomendaciones con Gifty para {personName}
            </h2>
            <p className="mb-0 mt-2 text-sm text-muted">
              Cuéntale qué buscas y Gifty encontrará ideas pensadas para esta
              persona.
            </p>
          </div>
        </header>
        <button
          type="button"
          aria-label="Cerrar recomendaciones"
          className="absolute right-[4.5%] top-[4.5%] inline-flex size-11 items-center justify-center rounded-full text-2xl text-primary/80 transition-colors hover:bg-accent-lavender/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={closeDialog}
        >
          <span aria-hidden="true">×</span>
        </button>
        <RecommendationsSection
          personId={personId}
          personName={personName}
          savedIdeasVersion={savedIdeasVersion}
          onSavedIdeasChanged={onSavedIdeasChanged}
        />
      </div>
    </dialog>
  );
}
