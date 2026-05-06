import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, SlidersHorizontal, ChevronDown, Loader2, ChevronLeft, ChevronRight } from 'lucide-angular';
import { CourseService } from '../../../core/services/course';
import { SearchService } from '../../../core/services/search';
import { CourseCardComponent } from '../../../shared/components/course-card/course-card';
import { BehaviorSubject, combineLatest, map, shareReplay, switchMap, debounceTime, distinctUntilChanged, startWith, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, CourseCardComponent],
  templateUrl: './catalog.html'
})
export class CatalogComponent implements OnInit {
  private courseService = inject(CourseService);
  private searchService = inject(SearchService);
  private route = inject(ActivatedRoute);

  readonly Search = Search;
  readonly SlidersHorizontal = SlidersHorizontal;
  readonly ChevronDown = ChevronDown;
  readonly Loader2 = Loader2;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;

  private categorySubject = new BehaviorSubject<string>('All');
  private searchSubject = new BehaviorSubject<string>('');

  categories = ['All', 'Development', 'Design', 'Marketing', 'Business', 'Data Science'];
  selectedCategory = 'All';
  searchQuery = '';
  isSearching = false;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchQuery = params['q'];
        this.searchSubject.next(this.searchQuery);
      } else {
        this.searchQuery = '';
        this.searchSubject.next('');
      }
    });
  }

  allCourses$ = this.courseService.getCourses().pipe(
    shareReplay(1)
  );

  searchResults$ = this.searchSubject.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(query => {
      if (!query.trim()) return of(null);
      this.isSearching = true;
      return this.searchService.search(query).pipe(
        map(results => {
          this.isSearching = false;
          return results;
        }),
        startWith([])
      );
    })
  );

  filteredCourses$ = combineLatest([
    this.allCourses$,
    this.searchResults$,
    this.categorySubject
  ]).pipe(
    map(([allCourses, searchResults, category]) => {
      // If there are search results (from MeiliSearch), use them. 
      // Otherwise, use all courses from the database.
      let baseCourses = searchResults !== null ? searchResults : allCourses;

      return baseCourses.filter(course => {
        const matchesCategory = category === 'All' || course.category === category;
        return matchesCategory;
      });
    })
  );

  onCategoryChange(category: string) {
    this.selectedCategory = category;
    this.categorySubject.next(category);
  }

  onSearchChange() {
    this.searchSubject.next(this.searchQuery);
  }
}
