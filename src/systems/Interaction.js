export function nearestInteraction(player, targets, radius) {
  let nearest = null;
  let closest = radius;
  for (const target of targets) {
    const distance = Math.hypot(player.x - target.x, player.y - target.y);
    // The porch must be approached from the street, not through the facade.
    if (player.y >= target.y && distance < closest) { nearest = target; closest = distance; }
  }
  return nearest;
}
