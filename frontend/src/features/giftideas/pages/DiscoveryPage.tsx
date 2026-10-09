
import { useEffect, useState, type FormEvent } from "react";
import {
  getGiftIdeas,
  getInterests,
  createGiftIdea,
  type GiftIdea,
  type Interest,
} from "../../../api/giftidea";

type DiscoveryPageProps = {
  accessToken: string | null;
};

export default function DiscoveryPage({
  accessToken,
}: DiscoveryPageProps) {
  const [giftIdeas, setGiftIdeas] = useState<GiftIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Creation form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);

  // Available interests from backend
  const [interests, setInterests] = useState<Interest[]>([]);
  const [interestsLoading, setInterestsLoading] = useState(false);
  const [interestsError, setInterestsError] = useState<string | null>(null);

  // Creation request state
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Fetch public GiftIdeas
  useEffect(() => {
    let cancelled = false;

    async function loadGiftIdeas() {
      try {
        const ideas = await getGiftIdeas();

        if (!cancelled) {
          setGiftIdeas(ideas);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load gift ideas",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadGiftIdeas();

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch interests only when authenticated
  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;

    async function loadInterests() {
      setInterestsLoading(true);
      setInterestsError(null);

      try {
        const availableInterests = await getInterests();

        if (!cancelled) {
          setInterests(availableInterests);
        }
      } catch (err) {
        if (!cancelled) {
          setInterestsError(
            err instanceof Error
              ? err.message
              : "Could not load interests",
          );
        }
      } finally {
        if (!cancelled) {
          setInterestsLoading(false);
        }
      }
    }

    void loadInterests();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  function toggleInterest(interest: Interest) {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessToken || creating) return;

    setCreateError(null);
    setCreateSuccess(false);

    const parsedPrice = Number(price);

    if (!name.trim() || !price.trim() || !Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setCreateError("Please enter a valid name and price.");
      return;
    }

    setCreating(true);

    try {
      const createdIdea = await createGiftIdea(
        {
          name: name.trim(),
          price: parsedPrice,
          interests: selectedInterests,
        },
        accessToken,
      );

      // Add the new idea to the discovery list
      setGiftIdeas((current) => [createdIdea, ...current]);

      // Reset the form
      setName("");
      setPrice("");
      setSelectedInterests([]);
      setCreateSuccess(true);
    } catch (err) {
      setCreateError(
        err instanceof Error
          ? err.message
          : "Could not create gift idea",
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-2 text-3xl font-bold">
        Discover Gift Ideas
      </h1>

      <p className="mb-8 text-gray-600">
        Find inspiration for your next gift.
      </p>

      {/* Creation form — authenticated users only */}
      {accessToken && (
        <section className="mb-10 rounded-lg border border-gray-200 p-5">
          <h2 className="mb-4 text-2xl font-semibold">
            Create a Gift Idea
          </h2>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="gift-name" className="mb-1 block">
                Name
              </label>
              <input
                id="gift-name"
                type="text"
                maxLength={100}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded border p-2"
              />
            </div>

            <div>
              <label htmlFor="gift-price" className="mb-1 block">
                Price (€)
              </label>
              <input
                id="gift-price"
                type="number"
                min="0"
                step="0.01"
                required
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="w-full rounded border p-2"
              />
            </div>

            <fieldset>
              <legend className="mb-2 font-medium">
                Interests (optional)
              </legend>

              {interestsLoading ? (
                <p role="status">Loading interests...</p>
              ) : interestsError ? (
                <p role="alert" className="text-red-600">
                  {interestsError}
                </p>
              ) : interests.length === 0 ? (
                <p>No interests available.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {interests.map((interest) => (
                    <label
                      key={interest}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        checked={selectedInterests.includes(interest)}
                        onChange={() => toggleInterest(interest)}
                      />
                      {interest.replaceAll("_", " ")}
                    </label>
                  ))}
                </div>
              )}
            </fieldset>

            {createError && (
              <p role="alert" className="text-red-600">
                {createError}
              </p>
            )}

            {createSuccess && (
              <p role="status" className="text-green-700">
                Gift idea created successfully!
              </p>
            )}

            <button
              type="submit"
              disabled={creating}
              className="rounded bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Gift Idea"}
            </button>
          </form>
        </section>
      )}

      {/* Public discovery list */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">
          Gift Ideas
        </h2>

        {loading ? (
          <p role="status">Loading gift ideas...</p>
        ) : error ? (
          <p role="alert" className="text-red-600">
            {error}
          </p>
        ) : giftIdeas.length === 0 ? (
          <p>No gift ideas available yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {giftIdeas.map((idea) => (
              <article
                key={idea.id}
                className="rounded-lg border border-gray-200 p-5 shadow-sm"
              >
                <h3 className="mb-2 text-xl font-semibold">
                  {idea.name}
                </h3>

                <p className="mb-3 font-medium">
                  {idea.price.toFixed(2)} €
                </p>

                <div className="flex flex-wrap gap-2">
                  {idea.interests.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                    >
                      {interest.replaceAll("_", " ")}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

