"use client";

import {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxClear,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxInputGroup,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxPortal,
  ComboboxPositioner,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox";

export function MultiSelectFilter({
  id,
  placeholder,
  options,
  selected,
  onChange,
}: {
  id: string;
  placeholder: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const labelPorValor = new Map(options.map((o) => [o.value, o.label]));

  return (
    <Combobox
      items={options.map((o) => o.value)}
      value={selected}
      onValueChange={(v) => onChange(v ?? [])}
      multiple
      itemToStringLabel={(value: string) => labelPorValor.get(value) ?? ""}
    >
      <ComboboxInputGroup className="flex-wrap">
        <ComboboxChips>
          <ComboboxValue>
            {(value: string[]) => (
              <>
                {value.map((v) => (
                  <ComboboxChip key={v}>
                    {labelPorValor.get(v) ?? v}
                    <ComboboxChipRemove aria-label={`Quitar ${labelPorValor.get(v) ?? v}`} />
                  </ComboboxChip>
                ))}
                <ComboboxInput
                  id={id}
                  placeholder={value.length > 0 ? "Buscar..." : placeholder}
                />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxClear />
        <ComboboxTrigger />
      </ComboboxInputGroup>
      <ComboboxPortal>
        <ComboboxPositioner>
          <ComboboxPopup>
            <ComboboxEmpty>Sin resultados.</ComboboxEmpty>
            <ComboboxList>
              {(value: string) => (
                <ComboboxItem key={value} value={value}>
                  {labelPorValor.get(value) ?? value}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxPopup>
        </ComboboxPositioner>
      </ComboboxPortal>
    </Combobox>
  );
}
