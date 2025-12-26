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

  useEffect(() => {
    if (type !== "letters") return;

    const loadLetters = async () => {
      for (const lang of LANGUAGES) {
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
        }
      }
    };

    loadLetters();
  }, [type]);

  const handleChange = (langCode, selectedValue) => {
    onChange({
      ...value,
      [langCode]: selectedValue, // stores LETTER TEXT (GOOD for backend)
    });
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      {LANGUAGES.map((lang) => {
        const id = `${label}_${lang.code}`;

        return (
          <div key={lang.code} className="flex flex-col space-y-1">
            <label htmlFor={id} className="text-sm font-medium text-gray-600">
              {label} ({lang.name})
            </label>

            {type === "letters" ? (
              <select
                id={id}
                value={value[lang.code] || ""}
                onChange={(e) => handleChange(lang.code, e.target.value)}
                className="border p-2 rounded-lg"
              >
                <option value="">Select Letter</option>

                {(letters[lang.code] || []).map((item) => (
                  <option key={item.position} value={item.letter}>
                    {item.letter}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={id}
                className="border p-2 rounded-lg"
                value={value[lang.code] || ""}
                onChange={(e) => handleChange(lang.code, e.target.value)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MultilingualInput;
