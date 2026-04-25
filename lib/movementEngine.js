import { supabase } from "@/lib/supabase";

export async function executeMovement({
  item_type,
  item_id,
  quantity,
  from_location_type,
  to_location_type,
  user_name,
  challan_number,
}) {
  if (!item_id) throw new Error("Invalid item");
  if (quantity <= 0) throw new Error("Invalid quantity");

  const table = item_type === "material" ? "materials" : "equipment";

  // ================= GET ITEM =================
  const { data: item, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", item_id)
    .single();

  if (error || !item) throw new Error("Item not found");

  // ================= MATERIAL LOGIC =================
  if (item_type === "material") {
    const currentQty = Number(item.quantity || 0);

    if (from_location_type !== "SUPPLIER" && currentQty < quantity) {
      throw new Error("Not enough stock");
    }

    let newQty = currentQty;

    if (from_location_type !== "SUPPLIER") newQty -= quantity;
    if (to_location_type === "SITE" || to_location_type === "PLOT")
      newQty += quantity;

    await supabase
      .from("materials")
      .update({ quantity: newQty })
      .eq("id", item_id);
  }

  // ================= EQUIPMENT LOGIC =================
  if (item_type === "equipment") {
    // equipment is usually 1 unit → ignore quantity complexity

    let newStatus = item.status;

    if (to_location_type === "SITE") {
      newStatus = "Active";
    } else if (to_location_type === "SERVICE") {
      newStatus = "In Service";
    } else if (to_location_type === "STORAGE") {
      newStatus = "Available";
    }

    await supabase
      .from("equipment")
      .update({
        current_location: null, // keeping simple for now
        status: newStatus,
        last_return_date:
          to_location_type === "STORAGE"
            ? new Date().toISOString()
            : item.last_return_date,
      })
      .eq("id", item_id);
  }

  // ================= LOG =================
  const { error: insertError } = await supabase
    .from("movements")
    .insert([
      {
        item_type,
        item_id,
        quantity,
        from_location_type,
        to_location_type,
        user_name,
        challan_number,
      },
    ]);

  if (insertError) throw new Error("Movement logging failed");

  return true;
}