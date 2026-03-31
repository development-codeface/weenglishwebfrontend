import React, { useState, useEffect } from "react";
import axios from "axios";
import { LANGUAGES } from "../../utils/constants";

const MultilingualInput = ({
  label,
  value = {},
  onChange,
  required = false,
  type = "input",
}) => {
  const [letters, setLetters] = useState({});
  const [loading, setLoading] = useState({});

  /* ---------------- LOAD LETTERS ---------------- */

  useEffect(() => {
    if (type !== "letters") return;

    const loadLetters = async () => {
      for (const lang of LANGUAGES) {
        setLoading((p) => ({ ...p, [lang.code]: true }));

        try {
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/letters/${lang.code}`
          );

          setLetters((prev) => ({
            ...prev,
            [lang.code]: res.data.letters || [],
          }));
        } catch (err) {
          console.error(`Failed to load ${lang.code} letters`, err);
        } finally {
          setLoading((p) => ({ ...p, [lang.code]: false }));
        }
      }
    };

    loadLetters();
  }, [type]);

  /* ---------------- CHANGE HANDLER ---------------- */

  const handleChange = (langCode, newValue) => {
    onChange({
      ...value,
      [langCode]: newValue || null, // STORE LETTER ID
    });
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      {LANGUAGES.map((lang) => {
        const id = `${label}_${lang.code}`;
        const options = letters[lang.code] || [];
        const selectedId = value?.[lang.code] || "";

        // 🔑 CRITICAL: match using `id`, not `_id`
        const hasSelected = options.some(
          (l) => l.id === selectedId
        );

        return (
          <div key={lang.code} className="flex flex-col space-y-1">
            <label htmlFor={id} className="text-sm font-medium text-gray-600">
              {label} ({lang.name})
            </label>

            {type === "letters" ? (
              loading[lang.code] ? (
                <div className="text-sm text-gray-400">
                  Loading letters…
                </div>
              ) : (
                <select
                  key={`${lang.code}-${options.length}-${selectedId}`}
                  id={id}
                  className="border p-2 rounded-lg"
                  value={hasSelected ? selectedId : ""}
                  onChange={(e) =>
                    handleChange(lang.code, e.target.value)
                  }
                >
                  <option value="">Select Letter</option>

                  {options.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.letter}
                    </option>
                  ))}
                </select>
              )
            ) : (
              <input
                id={id}
                className="border p-2 rounded-lg"
                value={value?.[lang.code] || ""}
                onChange={(e) =>
                  handleChange(lang.code, e.target.value)
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MultilingualInput;
