export interface Post {
  title: string;
  description?: string;
  // Puede venir como string desde contenido (MDX/collections)
  date: string | Date;
}
